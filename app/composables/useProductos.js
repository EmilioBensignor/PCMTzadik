import { useProductosStore } from '~/stores/productos'

export const useProductos = () => {
  const productosStore = useProductosStore()

  const productos = computed(() => productosStore.productos)
  const currentProduct = computed(() => productosStore.currentProduct)
  const loading = computed(() => productosStore.loading)
  const error = computed(() => productosStore.error)
  const totalPages = computed(() => productosStore.totalPages)
  const currentPage = computed(() => productosStore.currentPage)
  const totalCount = computed(() => productosStore.totalCount)
  const filters = computed(() => productosStore.filters)
  const getProductoById = (id) => productosStore.getProductoById(id)
  const getProductosByCategoria = (categoriaId) => productosStore.getProductosByCategoria(categoriaId)
  const getImagenesByProducto = (productoId) => productosStore.getImagenesByProducto(productoId)

  const createProductoCompleto = async (productoData, imagenes = []) => {
    try {
      if (!productoData.slug && productoData.titulo) {
        productoData.slug = await generateUniqueSlug(productoData.titulo)
      }

      productoData.activo = productoData.activo !== false
      productoData.destacado = productoData.destacado || false

      const producto = await productosStore.createProducto(productoData)

      if (imagenes.length > 0) {
        await handleImagenesUploadSeoFriendly(producto, imagenes)
      }

      await productosStore.fetchProductoById(producto.id, { includeAll: true })

      return producto
    } catch (error) {
      console.error('Error creating producto completo:', error)
      throw error
    }
  }

  const updateProductoCompleto = async (id, productoData, imagenes = []) => {
    try {
      if (productoData.titulo && (!productoData.slug || productoData.slug === '')) {
        productoData.slug = await generateUniqueSlug(productoData.titulo, id)
      }

      const producto = await productosStore.updateProducto(id, productoData)
      const productoConSlug = { ...producto, slug: productoData.slug || producto.slug }

      const currentImagenes = getImagenesByProducto(id)

      // Separar imágenes existentes de las nuevas
      const imagenesExistentes = imagenes.filter(img => img.isExisting === true && img.id)
      const imagenesNuevas = imagenes.filter(img => !img.isExisting || img.url?.startsWith('data:'))

      // Identificar imágenes que fueron eliminadas
      const imagenesAEliminar = currentImagenes.filter(current =>
        !imagenesExistentes.some(img => img.id === current.id)
      )

      // Verificar si hay cambios en el orden
      const hasOrderChanges = imagenesExistentes.some((img, index) => {
        const currentImg = currentImagenes.find(curr => curr.id === img.id)
        return currentImg && (currentImg.orden || 0) !== (index + 1)
      })

      const hasChanges = imagenesAEliminar.length > 0 || imagenesNuevas.length > 0 || hasOrderChanges

      if (hasChanges) {
        const supabase = useSupabaseClient()
        const { deleteProductoImagen: deleteFromStorage } = useStorage()

        // 1. Eliminar imágenes que ya no están
        for (const imagen of imagenesAEliminar) {
          try {
            // Eliminar del storage
            await deleteFromStorage(imagen.storage_path)

            // Eliminar de la BD
            await supabase
              .from('producto_imagenes')
              .delete()
              .eq('id', imagen.id)

            console.log(`Imagen eliminada: ${imagen.storage_path}`)
          } catch (deleteError) {
            console.warn(`Error eliminando imagen ${imagen.storage_path}:`, deleteError)
            // Continuar con las demás
          }
        }

        // 2. Subir nuevas imágenes solo
        if (imagenesNuevas.length > 0) {
          try {
            await handleImagenesUploadSeoFriendlyNew(productoConSlug, imagenesNuevas, imagenesExistentes.length)
          } catch (uploadError) {
            throw new Error(`Error al subir nuevas imágenes: ${uploadError.message}`)
          }
        }

        // 3. Actualizar orden de imágenes existentes si cambió
        if (hasOrderChanges) {
          for (let index = 0; index < imagenesExistentes.length; index++) {
            const imagen = imagenesExistentes[index]
            const newOrden = index + 1
            const isPrincipal = index === 0

            try {
              await supabase
                .from('producto_imagenes')
                .update({
                  orden: newOrden,
                  es_principal: isPrincipal
                })
                .eq('id', imagen.id)
            } catch (updateError) {
              console.warn(`Error actualizando orden de imagen ${imagen.id}:`, updateError)
            }
          }
        }
      }

      await productosStore.fetchProductoById(id, { includeAll: true })

      return producto
    } catch (error) {
      console.error('Error updating producto completo:', error)
      throw error
    }
  }

  const handleImagenesUpload = async (productoId, imagenes) => {
    const { uploadProductoImagen } = useStorage()

    try {
      const uploadPromises = imagenes.map(async (imagen, index) => {
        let storagePath
        let filename = `imagen-${index + 1}.jpg`
        let fileSize = 0
        let mimeType = 'image/jpeg'

        if (imagen.url && imagen.url.startsWith('data:')) {
          const response = await fetch(imagen.url)
          const blob = await response.blob()
          const file = new File([blob], filename, { type: blob.type })

          storagePath = await uploadProductoImagen(file, productoId)
          filename = file.name
          fileSize = file.size
          mimeType = file.type
        } else if (imagen.url) {
          storagePath = imagen.url
        } else {
          throw new Error('Formato de imagen no válido')
        }

        return useSupabaseClient()
          .from('producto_imagenes')
          .insert({
            producto_id: productoId,
            storage_path: storagePath,
            bucket_name: 'productos-imagenes',
            filename: filename,
            file_size: fileSize,
            mime_type: mimeType,
            orden: index + 1,
            es_principal: index === 0
          })
      })

      await Promise.all(uploadPromises)

      await productosStore.fetchProductosImagenes([productoId])
    } catch (error) {
      console.error('Error uploading imagenes:', error)
      throw error
    }
  }

  const handleImagenesUploadSeoFriendly = async (producto, imagenes) => {
    const { uploadProductoImagenSeoFriendly } = useStorage()

    const uploadErrors = []
    const successfulUploads = []

    try {
      const results = []

      for (let index = 0; index < imagenes.length; index++) {
        const imagen = imagenes[index]

        try {
          let storagePath
          let filename = `${producto.slug}-${index === 0 ? 'principal' : (index + 1).toString().padStart(2, '0')}.jpg`
          let fileSize = 0
          let mimeType = 'image/jpeg'

          if (imagen.url && imagen.url.startsWith('data:')) {
            const response = await fetch(imagen.url)
            const blob = await response.blob()
            const file = new File([blob], filename, { type: blob.type })

            storagePath = await uploadProductoImagenSeoFriendly(
              file,
              producto.slug,
              index + 1,
              index === 0
            )
            filename = file.name
            fileSize = file.size
            mimeType = file.type
          } else if (imagen.url) {
            if (imagen.url.includes('/productos-imagenes/')) {
              const urlParts = imagen.url.split('/productos-imagenes/')
              storagePath = urlParts[1]
            } else {
              storagePath = imagen.url
            }

            filename = imagen.filename || filename
            fileSize = imagen.file_size || 0
            mimeType = imagen.mime_type || 'image/jpeg'
          } else {
            throw new Error('Formato de imagen no válido')
          }

          const dbRecord = {
            producto_id: producto.id,
            storage_path: storagePath,
            bucket_name: 'productos-imagenes',
            filename: filename,
            file_size: fileSize,
            mime_type: mimeType,
            orden: index + 1,
            es_principal: index === 0
          }

          const supabase = useSupabaseClient()
          const result = await supabase
            .from('producto_imagenes')
            .insert(dbRecord)
            .select()

          if (result.error) {
            throw result.error
          }

          results.push(result)
          successfulUploads.push(filename)

        } catch (imageError) {
          const errorMsg = `Imagen ${index + 1} (${imagen.name || imagen.filename || 'sin nombre'}): ${imageError.message}`
          console.error(errorMsg, imageError)
          uploadErrors.push(errorMsg)
          // Continuamos con la siguiente imagen en lugar de abortar todo
        }
      }

      await productosStore.fetchProductosImagenes([producto.id])

      // Si hubo errores, los lanzamos pero después de haber subido las exitosas
      if (uploadErrors.length > 0) {
        const errorSummary = uploadErrors.length === imagenes.length
          ? 'No se pudo subir ninguna imagen'
          : `Se subieron ${successfulUploads.length} de ${imagenes.length} imágenes. Errores: ${uploadErrors.join('; ')}`

        throw new Error(errorSummary)
      }

    } catch (error) {
      console.error('Error uploading imagenes SEO-friendly:', error)
      throw error
    }
  }

  const handleImagenesUploadSeoFriendlyNew = async (producto, imagenesNuevas, offsetIndex = 0) => {
    const { uploadProductoImagenSeoFriendly } = useStorage()

    const uploadErrors = []
    const successfulUploads = []
    const uploadedPaths = [] // Para rollback en caso de error

    try {
      const supabase = useSupabaseClient()

      for (let i = 0; i < imagenesNuevas.length; i++) {
        const imagen = imagenesNuevas[i]
        const globalIndex = offsetIndex + i

        try {
          // Validar que la imagen tenga datos válidos
          if (!imagen.url || !imagen.url.startsWith('data:')) {
            throw new Error('Imagen sin datos válidos para subir')
          }

          const filename = `${producto.slug}-${globalIndex === 0 ? 'principal' : (globalIndex + 1).toString().padStart(2, '0')}.jpg`

          const response = await fetch(imagen.url)
          const blob = await response.blob()

          // Validar que el blob sea válido
          if (!blob || blob.size === 0) {
            throw new Error('Imagen corrupta o vacía')
          }

          const file = new File([blob], filename, { type: blob.type })

          // Intentar subir al storage
          const storagePath = await uploadProductoImagenSeoFriendly(
            file,
            producto.slug,
            globalIndex + 1,
            globalIndex === 0
          )

          // Si la subida fue exitosa, guardar en BD
          const dbRecord = {
            producto_id: producto.id,
            storage_path: storagePath,
            bucket_name: 'productos-imagenes',
            filename: file.name,
            file_size: file.size,
            mime_type: file.type,
            orden: globalIndex + 1,
            es_principal: globalIndex === 0
          }

          const result = await supabase
            .from('producto_imagenes')
            .insert(dbRecord)
            .select()

          if (result.error) {
            // Si falla la BD, eliminar del storage
            const { deleteProductoImagen } = useStorage()
            try {
              await deleteProductoImagen(storagePath)
            } catch (cleanupError) {
              console.warn('Error limpiando archivo huérfano:', cleanupError)
            }
            throw result.error
          }

          successfulUploads.push(file.name)
          uploadedPaths.push(storagePath)

        } catch (imageError) {
          const errorMsg = `Imagen ${i + 1} (${imagen.name || 'sin nombre'}): ${imageError.message}`
          console.error(errorMsg, imageError)
          uploadErrors.push(errorMsg)

          // Si falla una imagen, hacer rollback de las subidas exitosas
          if (uploadedPaths.length > 0) {
            console.warn('Iniciando rollback de imágenes subidas...')
            const { deleteProductoImagen } = useStorage()

            for (const path of uploadedPaths) {
              try {
                await deleteProductoImagen(path)
                await supabase
                  .from('producto_imagenes')
                  .delete()
                  .eq('storage_path', path)
              } catch (rollbackError) {
                console.error('Error en rollback:', rollbackError)
              }
            }
          }

          throw new Error(errorMsg)
        }
      }

      await productosStore.fetchProductosImagenes([producto.id])

      return successfulUploads

    } catch (error) {
      console.error('Error uploading nuevas imagenes:', error)
      throw error
    }
  }


  const deleteProductoImagen = async (imagenId, storagePath) => {
    const { deleteProductoImagen: deleteFromStorage } = useStorage()

    try {
      await deleteFromStorage(storagePath)

      await useSupabaseClient()
        .from('producto_imagenes')
        .delete()
        .eq('id', imagenId)

      productosStore.productosImagenes = productosStore.productosImagenes.filter(
        img => img.id !== imagenId
      )
    } catch (error) {
      console.error('Error deleting imagen:', error)
      throw error
    }
  }

  const deleteAllProductoImagenes = async (productoId) => {
    const { deleteProductoImagen: deleteFromStorage } = useStorage()

    try {
      const { data: imagenes, error: fetchError } = await useSupabaseClient()
        .from('producto_imagenes')
        .select('id, storage_path')
        .eq('producto_id', productoId)

      if (fetchError) throw fetchError

      if (imagenes && imagenes.length > 0) {
        const deletePromises = imagenes.map(async (imagen) => {
          try {
            await deleteFromStorage(imagen.storage_path)
          } catch (storageError) {
            console.warn(`Error deleting image from storage: ${imagen.storage_path}`, storageError)
          }

          return useSupabaseClient()
            .from('producto_imagenes')
            .delete()
            .eq('id', imagen.id)
        })

        await Promise.all(deletePromises)
      }

      productosStore.productosImagenes = productosStore.productosImagenes.filter(
        img => img.producto_id !== productoId
      )
    } catch (error) {
      console.error('Error deleting all product images:', error)
      throw error
    }
  }


  const searchProductos = async (searchParams = {}) => {
    productosStore.clearFilters()

    Object.entries(searchParams).forEach(([key, value]) => {
      if (key === 'datos_dinamicos') {
        Object.entries(value).forEach(([campo, valor]) => {
          productosStore.setDynamicFilter(campo, valor)
        })
      } else {
        productosStore.setFilter(key, value)
      }
    })

    await productosStore.fetchProductos({ includeImages: true })
  }

  const getFeaturedProductos = async (limit = 8) => {
    try {
      const { data, error } = await useSupabaseClient()
        .from('productos')
        .select(`
          *,
          categorias(id, nombre, icon),
          producto_imagenes!inner(storage_path, es_principal)
        `)
        .eq('producto_imagenes.es_principal', true)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching featured productos:', error)
      return []
    }
  }

  const getRelatedProductos = async (productoId, categoriaId, limit = 4) => {
    try {
      const { data, error } = await useSupabaseClient()
        .from('productos')
        .select(`
          *,
          producto_imagenes!inner(storage_path, es_principal)
        `)
        .eq('categoria_id', categoriaId)
        .neq('id', productoId)
        .eq('producto_imagenes.es_principal', true)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching related productos:', error)
      return []
    }
  }

  const formatDynamicData = (producto, campos) => {
    if (!producto.datos_dinamicos || !campos) return {}

    const formatted = {}

    campos.forEach(campo => {
      const value = producto.datos_dinamicos[campo.nombre_campo]
      if (value !== undefined && value !== null && value !== '') {
        let formattedValue = value

        switch (campo.tipo) {
          case 'currency':
            formattedValue = new Intl.NumberFormat('es-CO', {
              style: 'currency',
              currency: 'COP',
              minimumFractionDigits: 0
            }).format(value)
            break
          case 'number':
            formattedValue = new Intl.NumberFormat('es-CO').format(value)
            break
          case 'date':
            formattedValue = new Date(value).toLocaleDateString('es-CO')
            break
          case 'boolean':
            formattedValue = value ? 'Sí' : 'No'
            break
          default:
            formattedValue = value
        }

        formatted[campo.label] = formattedValue
      }
    })

    return formatted
  }

  const generateSlug = (titulo) => {
    return titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-')
  }

  const generateUniqueSlug = async (titulo, excludeId = null) => {
    const baseSlug = generateSlug(titulo)
    let slug = baseSlug
    let counter = 1

    while (true) {
      try {
        let query = useSupabaseClient()
          .from('productos')
          .select('id')
          .eq('slug', slug)

        if (excludeId) {
          query = query.neq('id', excludeId)
        }

        const { data } = await query

        if (!data || data.length === 0) {
          return slug
        }

        slug = `${baseSlug}-${counter}`
        counter++
      } catch (error) {
        console.error('Error checking slug uniqueness:', error)
        return `${baseSlug}-${Date.now()}`
      }
    }
  }

  const addVideoToProduct = async (productoId, videoData) => {
    try {
      const producto = await productosStore.getProductoById(productoId)
      const videos = producto.videos ? [...producto.videos, videoData] : [videoData]

      await productosStore.updateProducto(productoId, { videos })
    } catch (error) {
      console.error('Error adding video to product:', error)
      throw error
    }
  }

  const removeVideoFromProduct = async (productoId, videoIndex) => {
    try {
      const producto = await productosStore.getProductoById(productoId)
      const videos = producto.videos ? [...producto.videos] : []
      videos.splice(videoIndex, 1)

      await productosStore.updateProducto(productoId, { videos })
    } catch (error) {
      console.error('Error removing video from product:', error)
      throw error
    }
  }

  return {
    productos,
    currentProduct,
    loading,
    error,
    totalPages,
    currentPage,
    totalCount,
    filters,

    getProductoById,
    getProductosByCategoria,
    getImagenesByProducto,

    createProductoCompleto,
    updateProductoCompleto,
    deleteProducto: productosStore.deleteProducto,

    handleImagenesUpload,
    handleImagenesUploadSeoFriendly,
    deleteProductoImagen,
    deleteAllProductoImagenes,
    addVideoToProduct,
    removeVideoFromProduct,

    searchProductos,
    setFilter: productosStore.setFilter,
    setDynamicFilter: productosStore.setDynamicFilter,
    clearFilters: productosStore.clearFilters,
    setSorting: productosStore.setSorting,
    setPage: productosStore.setPage,

    fetchProductos: productosStore.fetchProductos,
    fetchProductoById: productosStore.fetchProductoById,
    getFeaturedProductos,
    getRelatedProductos,

    formatDynamicData,
    generateSlug,
    generateUniqueSlug,
    getImageUrl: productosStore.getImageUrl
  }
}
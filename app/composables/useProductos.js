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

      const currentImagenes = getImagenesByProducto(id)
      const hasNewImages = imagenes.some(img => img.url && img.url.startsWith('data:'))
      const hasChangedImageCount = imagenes.length !== currentImagenes.length
      const hasNewUploads = imagenes.some(img => img.isExisting === false || img.file !== null)

      const hasOrderChanges = imagenes.some((img, index) => {
        const currentImg = currentImagenes.find(curr => curr.id === img.id)
        return currentImg && (currentImg.orden || 0) !== (index + 1)
      })

      const hasChanges = hasNewImages || hasChangedImageCount || hasNewUploads || hasOrderChanges


      if (hasChanges) {
        await deleteAllProductoImagenes(id)

        if (imagenes.length > 0) {
          const productoConSlug = { ...producto, slug: productoData.slug || producto.slug }
          await handleImagenesUploadSeoFriendly(productoConSlug, imagenes)
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


    try {
      const results = []

      for (let index = 0; index < imagenes.length; index++) {
        const imagen = imagenes[index]

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
      }

      await productosStore.fetchProductosImagenes([producto.id])

    } catch (error) {
      console.error('Error uploading imagenes SEO-friendly:', error)
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
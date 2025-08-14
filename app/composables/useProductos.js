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
  // Getters
  const getProductoById = (id) => productosStore.getProductoById(id)
  const getProductosByCategoria = (categoriaId) => productosStore.getProductosByCategoria(categoriaId)
  const getImagenesByProducto = (productoId) => productosStore.getImagenesByProducto(productoId)
  
  const createProductoCompleto = async (productoData, imagenes = []) => {
    try {
      // Generar slug automáticamente si no se proporciona
      if (!productoData.slug && productoData.titulo) {
        productoData.slug = await generateUniqueSlug(productoData.titulo)
      }
      
      // Asegurar que activo y destacado sean true por defecto
      productoData.activo = productoData.activo !== false
      productoData.destacado = productoData.destacado || false
      
      const producto = await productosStore.createProducto(productoData)
      
      if (imagenes.length > 0) {
        // Usar el nuevo sistema SEO-friendly
        await handleImagenesUploadSeoFriendly(producto, imagenes)
      }
      
      await productosStore.fetchProductoById(producto.id, { includeAll: true })
      
      return producto
    } catch (error) {
      console.error('Error creating producto completo:', error)
      throw error
    }
  }
  
  // Función para actualizar un producto completo
  const updateProductoCompleto = async (id, productoData, nuevasImagenes = []) => {
    try {
      // Generar nuevo slug si el título cambió
      if (productoData.titulo && (!productoData.slug || productoData.slug === '')) {
        productoData.slug = await generateUniqueSlug(productoData.titulo, id)
      }
      
      // Actualizar datos del producto
      const producto = await productosStore.updateProducto(id, productoData)
      
      // Manejar nuevas imágenes si existen
      if (nuevasImagenes.length > 0) {
        // Asegurar que tenemos el producto con el slug actualizado
        const productoConSlug = { ...producto, slug: productoData.slug || producto.slug }
        await handleImagenesUploadSeoFriendly(productoConSlug, nuevasImagenes)
      }
      
      // Recargar el producto actualizado
      await productosStore.fetchProductoById(id, { includeAll: true })
      
      return producto
    } catch (error) {
      console.error('Error updating producto completo:', error)
      throw error
    }
  }
  
  // Función helper para manejar upload de imágenes
  const handleImagenesUpload = async (productoId, imagenes) => {
    const { uploadProductoImagen } = useStorage()
    
    try {
      const uploadPromises = imagenes.map(async (imagen, index) => {
        let storagePath
        let filename = `imagen-${index + 1}.jpg`
        let fileSize = 0
        let mimeType = 'image/jpeg'
        
        // Si la imagen es un Data URL (base64), convertirla a File
        if (imagen.url && imagen.url.startsWith('data:')) {
          // Convertir base64 a File
          const response = await fetch(imagen.url)
          const blob = await response.blob()
          const file = new File([blob], filename, { type: blob.type })
          
          // Subir archivo al storage
          storagePath = await uploadProductoImagen(file, productoId)
          filename = file.name
          fileSize = file.size
          mimeType = file.type
        } else if (imagen.url) {
          // Si ya es una URL válida del storage, usar directamente
          storagePath = imagen.url
        } else {
          throw new Error('Formato de imagen no válido')
        }
        
        // Crear registro en BD
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
      
      // Recargar imágenes del producto
      await productosStore.fetchProductosImagenes([productoId])
    } catch (error) {
      console.error('Error uploading imagenes:', error)
      throw error
    }
  }

  // Función moderna para manejar upload de imágenes con URLs SEO-friendly
  const handleImagenesUploadSeoFriendly = async (producto, imagenes) => {
    const { uploadProductoImagenSeoFriendly } = useStorage()
    
    try {
      const uploadPromises = imagenes.map(async (imagen, index) => {
        let storagePath
        let filename = `${producto.slug}-${index === 0 ? 'principal' : (index + 1).toString().padStart(2, '0')}.jpg`
        let fileSize = 0
        let mimeType = 'image/jpeg'
        
        // Si la imagen es un Data URL (base64), convertirla a File
        if (imagen.url && imagen.url.startsWith('data:')) {
          // Convertir base64 a File
          const response = await fetch(imagen.url)
          const blob = await response.blob()
          const file = new File([blob], filename, { type: blob.type })
          
          // Subir archivo al storage con estructura SEO-friendly
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
          // Si ya es una URL válida del storage, usar directamente
          storagePath = imagen.url
        } else {
          throw new Error('Formato de imagen no válido')
        }
        
        // Crear registro en BD
        return useSupabaseClient()
          .from('producto_imagenes')
          .insert({
            producto_id: producto.id,
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
      
      // Recargar imágenes del producto
      await productosStore.fetchProductosImagenes([producto.id])
      
    } catch (error) {
      console.error('Error uploading imagenes SEO-friendly:', error)
      throw error
    }
  }
  
  
  // Función para eliminar imagen
  const deleteProductoImagen = async (imagenId, storagePath) => {
    const { deleteProductoImagen: deleteFromStorage } = useStorage()
    
    try {
      // Eliminar del storage
      await deleteFromStorage(storagePath)
      
      // Eliminar registro de BD
      await useSupabaseClient()
        .from('producto_imagenes')
        .delete()
        .eq('id', imagenId)
      
      // Actualizar estado local
      productosStore.productosImagenes = productosStore.productosImagenes.filter(
        img => img.id !== imagenId
      )
    } catch (error) {
      console.error('Error deleting imagen:', error)
      throw error
    }
  }
  
  
  // Función para buscar productos con filtros avanzados
  const searchProductos = async (searchParams = {}) => {
    // Resetear filtros
    productosStore.clearFilters()
    
    // Aplicar nuevos filtros
    Object.entries(searchParams).forEach(([key, value]) => {
      if (key === 'datos_dinamicos') {
        Object.entries(value).forEach(([campo, valor]) => {
          productosStore.setDynamicFilter(campo, valor)
        })
      } else {
        productosStore.setFilter(key, value)
      }
    })
    
    // Ejecutar búsqueda
    await productosStore.fetchProductos({ includeImages: true })
  }
  
  // Función para obtener productos populares/destacados
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
  
  // Función para obtener productos relacionados
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
  
  // Función para formatear datos dinámicos para mostrar
  const formatDynamicData = (producto, campos) => {
    if (!producto.datos_dinamicos || !campos) return {}
    
    const formatted = {}
    
    campos.forEach(campo => {
      const value = producto.datos_dinamicos[campo.nombre_campo]
      if (value !== undefined && value !== null && value !== '') {
        // Formateo básico sin dependencia externa
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
  
  // Función para generar slug básico
  const generateSlug = (titulo) => {
    return titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
      .replace(/\s+/g, '-') // Espacios a guiones
      .replace(/-+/g, '-') // Múltiples guiones a uno
      .trim('-') // Remover guiones al inicio/final
  }
  
  // Función para generar slug único verificando duplicados
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
  
  // Función para manejar videos como JSONB
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
    // Estado reactivo
    productos,
    currentProduct,
    loading,
    error,
    totalPages,
    currentPage,
    totalCount,
    filters,
    
    // Getters
    getProductoById,
    getProductosByCategoria,
    getImagenesByProducto,
    
    // CRUD operations
    createProductoCompleto,
    updateProductoCompleto,
    deleteProducto: productosStore.deleteProducto,
    
    // Media management
    handleImagenesUpload,
    handleImagenesUploadSeoFriendly,
    deleteProductoImagen,
    addVideoToProduct,
    removeVideoFromProduct,
    
    // Search & filtering
    searchProductos,
    setFilter: productosStore.setFilter,
    setDynamicFilter: productosStore.setDynamicFilter,
    clearFilters: productosStore.clearFilters,
    setSorting: productosStore.setSorting,
    setPage: productosStore.setPage,
    
    // Data fetching
    fetchProductos: productosStore.fetchProductos,
    fetchProductoById: productosStore.fetchProductoById,
    getFeaturedProductos,
    getRelatedProductos,
    
    // Utilities
    formatDynamicData,
    generateSlug,
    generateUniqueSlug,
    getImageUrl: productosStore.getImageUrl
  }
}
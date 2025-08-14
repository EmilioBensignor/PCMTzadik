export const useStorage = () => {
  const supabase = useSupabaseClient()
  const config = useRuntimeConfig()
  
  const uploading = ref(false)
  const uploadProgress = ref(0)
  const error = ref(null)

  const generateUniqueFileName = (originalName, prefix = '') => {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const extension = originalName.split('.').pop()
    const baseName = originalName.split('.').slice(0, -1).join('.')
    
    return `${prefix}${timestamp}-${random}-${baseName}.${extension}`
  }

  const generateSeoFriendlyFileName = (originalName, productSlug, index = 1, isPrincipal = false) => {
    const extension = originalName.split('.').pop().toLowerCase()
    const suffix = isPrincipal ? 'principal' : index.toString().padStart(2, '0')
    
    // Limpiar el slug para nombres de archivo (solo letras, números y guiones)
    const cleanSlug = productSlug.toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    
    return `${cleanSlug}-${suffix}.${extension}`
  }

  const validateImageFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    const maxSize = 10 * 1024 * 1024
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Tipo de archivo no permitido. Solo se permiten: JPEG, PNG, WebP, GIF')
    }
    
    if (file.size > maxSize) {
      throw new Error('El archivo es demasiado grande. Máximo 10MB')
    }
    
    return true
  }

  const validateVideoFile = (file) => {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov']
    const maxSize = 100 * 1024 * 1024
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Tipo de archivo no permitido. Solo se permiten: MP4, WebM, OGG, AVI, MOV')
    }
    
    if (file.size > maxSize) {
      throw new Error('El archivo es demasiado grande. Máximo 100MB')
    }
    
    return true
  }

  const uploadProductoImagen = async (file, productoId) => {
    try {
      uploading.value = true
      uploadProgress.value = 0
      error.value = null
      
      validateImageFile(file)
      
      const fileName = generateUniqueFileName(file.name, `producto-${productoId}-`)
      const filePath = `${productoId}/${fileName}`
      
      const { data, error: uploadError } = await supabase.storage
        .from('productos-imagenes')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })
      
      if (uploadError) throw uploadError
      
      uploadProgress.value = 100
      return data.path
      
    } catch (err) {
      error.value = err.message
      console.error('Error uploading imagen:', err)
      throw err
    } finally {
      uploading.value = false
    }
  }

  const uploadProductoImagenSeoFriendly = async (file, productSlug, index = 1, isPrincipal = false) => {
    try {
      uploading.value = true
      uploadProgress.value = 0
      error.value = null
      
      validateImageFile(file)
      
      const fileName = generateSeoFriendlyFileName(file.name, productSlug, index, isPrincipal)
      const filePath = `${productSlug}/${fileName}`
      
      const { data, error: uploadError } = await supabase.storage
        .from('productos-imagenes')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true // Permitir sobreescribir si ya existe
        })
      
      if (uploadError) throw uploadError
      
      uploadProgress.value = 100
      return data.path
      
    } catch (err) {
      error.value = err.message
      console.error('Error uploading imagen SEO-friendly:', err)
      throw err
    } finally {
      uploading.value = false
    }
  }

  const uploadProductoImagenes = async (files, productoId) => {
    try {
      uploading.value = true
      error.value = null
      
      const uploadPromises = files.map(async (file, index) => {
        uploadProgress.value = Math.round((index / files.length) * 100)
        return await uploadProductoImagen(file, productoId)
      })
      
      const paths = await Promise.all(uploadPromises)
      uploadProgress.value = 100
      
      return paths
      
    } catch (err) {
      error.value = err.message
      console.error('Error uploading imagenes:', err)
      throw err
    } finally {
      uploading.value = false
    }
  }

  const uploadProductoImagenesSeoFriendly = async (files, productSlug) => {
    try {
      uploading.value = true
      error.value = null
      
      const uploadPromises = files.map(async (file, index) => {
        uploadProgress.value = Math.round((index / files.length) * 100)
        const isPrincipal = index === 0 // Primera imagen es principal
        return await uploadProductoImagenSeoFriendly(file, productSlug, index + 1, isPrincipal)
      })
      
      const paths = await Promise.all(uploadPromises)
      uploadProgress.value = 100
      
      return paths
      
    } catch (err) {
      error.value = err.message
      console.error('Error uploading imagenes SEO-friendly:', err)
      throw err
    } finally {
      uploading.value = false
    }
  }

  const uploadProductoVideo = async (file, productoId) => {
    try {
      uploading.value = true
      uploadProgress.value = 0
      error.value = null
      
      validateVideoFile(file)
      
      const fileName = generateUniqueFileName(file.name, `video-${productoId}-`)
      const filePath = `${productoId}/${fileName}`
      
      const { data, error: uploadError } = await supabase.storage
        .from('productos-videos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })
      
      if (uploadError) throw uploadError
      
      uploadProgress.value = 100
      return data.path
      
    } catch (err) {
      error.value = err.message
      console.error('Error uploading video:', err)
      throw err
    } finally {
      uploading.value = false
    }
  }

  const uploadProductoVideos = async (files, productoId) => {
    try {
      uploading.value = true
      error.value = null
      
      const uploadPromises = files.map(async (file, index) => {
        uploadProgress.value = Math.round((index / files.length) * 100)
        return await uploadProductoVideo(file, productoId)
      })
      
      const paths = await Promise.all(uploadPromises)
      uploadProgress.value = 100
      
      return paths
      
    } catch (err) {
      error.value = err.message
      console.error('Error uploading videos:', err)
      throw err
    } finally {
      uploading.value = false
    }
  }

  const deleteProductoImagen = async (storagePath) => {
    try {
      error.value = null
      
      const { error: deleteError } = await supabase.storage
        .from('productos-imagenes')
        .remove([storagePath])
      
      if (deleteError) throw deleteError
      
    } catch (err) {
      error.value = err.message
      console.error('Error deleting imagen:', err)
      throw err
    }
  }

  const deleteProductoVideo = async (storagePath) => {
    try {
      error.value = null
      
      const { error: deleteError } = await supabase.storage
        .from('productos-videos')
        .remove([storagePath])
      
      if (deleteError) throw deleteError
      
    } catch (err) {
      error.value = err.message
      console.error('Error deleting video:', err)
      throw err
    }
  }

  const getImageUrl = (storagePath) => {
    if (!storagePath) return null
    return `${config.public.supabase.url}/storage/v1/object/public/productos-imagenes/${storagePath}`
  }

  const getVideoUrl = (storagePath) => {
    if (!storagePath) return null
    return `${config.public.supabase.url}/storage/v1/object/public/productos-videos/${storagePath}`
  }

  const getImageUrlWithTransform = (storagePath, options = {}) => {
    if (!storagePath) return null
    
    const baseUrl = `${config.public.supabase.url}/storage/v1/object/public/productos-imagenes/${storagePath}`
    
    const params = new URLSearchParams()
    
    if (options.width) params.append('width', options.width)
    if (options.height) params.append('height', options.height)
    if (options.quality) params.append('quality', options.quality)
    if (options.format) params.append('format', options.format)
    if (options.resize) params.append('resize', options.resize)
    
    const queryString = params.toString()
    return queryString ? `${baseUrl}?${queryString}` : baseUrl
  }

  const resizeImageFile = async (file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        let { width, height } = img
        
        if (width > height) {
          if (width > maxWidth) {
            height = height * (maxWidth / width)
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = width * (maxHeight / height)
            height = maxHeight
          }
        }
        
        canvas.width = width
        canvas.height = height
        
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(resolve, 'image/jpeg', quality)
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  const generateVideoThumbnail = async (file, timeInSeconds = 1) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      video.addEventListener('loadedmetadata', () => {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        video.currentTime = timeInSeconds
      })
      
      video.addEventListener('seeked', () => {
        ctx.drawImage(video, 0, 0)
        canvas.toBlob(resolve, 'image/jpeg', 0.8)
        URL.revokeObjectURL(video.src)
      })
      
      video.addEventListener('error', reject)
      
      video.src = URL.createObjectURL(file)
    })
  }

  const getFileMetadata = async (file) => {
    const metadata = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    }
    
    if (file.type.startsWith('image/')) {
      const dimensions = await getImageDimensions(file)
      metadata.width = dimensions.width
      metadata.height = dimensions.height
    }
    
    if (file.type.startsWith('video/')) {
      const videoDuration = await getVideoDuration(file)
      metadata.duration = videoDuration
    }
    
    return metadata
  }

  const getImageDimensions = (file) => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight
        })
        URL.revokeObjectURL(img.src)
      }
      img.src = URL.createObjectURL(file)
    })
  }

  const getVideoDuration = (file) => {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.addEventListener('loadedmetadata', () => {
        resolve(video.duration)
        URL.revokeObjectURL(video.src)
      })
      video.src = URL.createObjectURL(file)
    })
  }

  return {
    uploading: readonly(uploading),
    uploadProgress: readonly(uploadProgress),
    error: readonly(error),
    
    uploadProductoImagen,
    uploadProductoImagenes,
    uploadProductoImagenSeoFriendly,
    uploadProductoImagenesSeoFriendly,
    uploadProductoVideo,
    uploadProductoVideos,
    
    deleteProductoImagen,
    deleteProductoVideo,
    
    getImageUrl,
    getVideoUrl,
    getImageUrlWithTransform,
    
    validateImageFile,
    validateVideoFile,
    generateUniqueFileName,
    generateSeoFriendlyFileName,
    resizeImageFile,
    generateVideoThumbnail,
    getFileMetadata,
    getImageDimensions,
    getVideoDuration
  }
}
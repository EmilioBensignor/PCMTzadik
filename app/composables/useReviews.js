import { useReviewsStore } from '~/stores/reviews'
import { useStorage } from '~/composables/useStorage'

export const useReviews = () => {
  const reviewsStore = useReviewsStore()
  
  const reviews = computed(() => reviewsStore.reviews)
  const currentReview = computed(() => reviewsStore.currentReview)
  const loading = computed(() => reviewsStore.loading)
  const error = computed(() => reviewsStore.error)
  const totalPages = computed(() => reviewsStore.totalPages)
  const currentPage = computed(() => reviewsStore.currentPage)
  const totalCount = computed(() => reviewsStore.totalCount)
  const filters = computed(() => reviewsStore.filters)
  const sorting = computed(() => reviewsStore.sorting)

  const getReviewById = (id) => reviewsStore.getReviewById(id)
  const getReviewsByRating = (rating) => reviewsStore.getReviewsByRating(rating)
  const getReviewsByCiudad = (ciudad) => reviewsStore.getReviewsByCiudad(ciudad)
  const getAverageRating = computed(() => reviewsStore.getAverageRating)
  const getRatingDistribution = computed(() => reviewsStore.getRatingDistribution)

  const createReviewCompleta = async (reviewData, imagen = null) => {
    try {
      let imageUrl = null

      if (imagen) {
        imageUrl = await uploadReviewImage(imagen, reviewData)
      }

      const review = await reviewsStore.createReview({
        ...reviewData,
        img: imageUrl
      })

      return review
    } catch (error) {
      console.error('Error creating review completa:', error)
      throw error
    }
  }

  const updateReviewCompleta = async (id, reviewData, nuevaImagen = null) => {
    try {
      let imageUrl = reviewData.img

      if (nuevaImagen) {
        if (reviewData.img) {
          await deleteReviewImage(reviewData.img)
        }
        
        imageUrl = await uploadReviewImage(nuevaImagen, reviewData)
      }

      const review = await reviewsStore.updateReview(id, {
        ...reviewData,
        img: imageUrl
      })

      return review
    } catch (error) {
      console.error('Error updating review completa:', error)
      throw error
    }
  }

  const uploadReviewImage = async (imagen, reviewData) => {
    const { uploadReviewImage: uploadToStorage, getReviewImageUrl } = useStorage()

    try {
      let file
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(2, 8)
      let filename = `review-${generateSlug(reviewData.autor)}-${generateSlug(reviewData.titulo)}-${timestamp}-${randomId}.jpg`

      if (imagen.url && imagen.url.startsWith('data:')) {
        const response = await fetch(imagen.url)
        const blob = await response.blob()
        file = new File([blob], filename, { type: blob.type })
      } else if (imagen instanceof File) {
        file = imagen
        const extension = file.name.split('.').pop()
        filename = `review-${generateSlug(reviewData.autor)}-${generateSlug(reviewData.titulo)}-${timestamp}-${randomId}.${extension}`
      } else {
        throw new Error('Formato de imagen no válido')
      }

      const storagePath = await uploadToStorage(file, filename)
      
      return getReviewImageUrl(storagePath, true)

    } catch (error) {
      console.error('Error uploading review image:', error)
      throw error
    }
  }

  const deleteReviewImage = async (imageUrl) => {
    const { deleteReviewImage: deleteFromStorage } = useStorage()

    try {
      if (!imageUrl || typeof imageUrl !== 'string') {
        console.warn('Invalid image URL for deletion:', imageUrl)
        return
      }

      const urlParts = imageUrl.split('/reviews-imagenes/')
      if (urlParts.length > 1) {
        const storagePath = urlParts[1]
        await deleteFromStorage(storagePath)
      }
    } catch (error) {
      console.error('Error deleting review image:', error)
    }
  }

  const deleteReviewCompleta = async (id) => {
    try {
      const review = getReviewById(id)
      
      if (review?.img) {
        await deleteReviewImage(review.img)
      }

      await reviewsStore.deleteReview(id)

    } catch (error) {
      console.error('Error deleting review completa:', error)
      throw error
    }
  }

  const getPublicReviews = async (limit = 10) => {
    try {
      const { data, error } = await useSupabaseClient()
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching public reviews:', error)
      return []
    }
  }

  const getReviewStats = async () => {
    try {
      const { data, error } = await useSupabaseClient()
        .from('reviews')
        .select('rating')

      if (error) throw error

      const ratings = data || []
      const total = ratings.length

      if (total === 0) {
        return {
          total: 0,
          average: 0,
          distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        }
      }

      const sum = ratings.reduce((acc, review) => acc + review.rating, 0)
      const average = (sum / total).toFixed(1)

      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      ratings.forEach(review => {
        distribution[review.rating]++
      })

      return {
        total,
        average: parseFloat(average),
        distribution
      }

    } catch (error) {
      console.error('Error fetching review stats:', error)
      return {
        total: 0,
        average: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      }
    }
  }

  const generateSlug = (texto) => {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-')
  }

  const getCiudadesUnicas = async () => {
    try {
      const { data, error } = await useSupabaseClient()
        .from('reviews')
        .select('ciudad')

      if (error) throw error

      const ciudades = [...new Set(data.map(review => review.ciudad))].sort()
      return ciudades

    } catch (error) {
      console.error('Error fetching ciudades:', error)
      return []
    }
  }

  const getProvinciasUnicas = async () => {
    try {
      const { data, error } = await useSupabaseClient()
        .from('reviews')
        .select('provincia')

      if (error) throw error

      const provincias = [...new Set(data.map(review => review.provincia))].sort()
      return provincias

    } catch (error) {
      console.error('Error fetching provincias:', error)
      return []
    }
  }

  return {
    reviews,
    currentReview,
    loading,
    error,
    totalPages,
    currentPage,
    totalCount,
    filters,
    sorting,

    getReviewById,
    getReviewsByRating,
    getReviewsByCiudad,
    getAverageRating,
    getRatingDistribution,

    createReviewCompleta,
    updateReviewCompleta,
    deleteReviewCompleta,
    toggleReviewStatus: reviewsStore.toggleReviewStatus,

    uploadReviewImage,
    deleteReviewImage,

    setFilter: reviewsStore.setFilter,
    clearFilters: reviewsStore.clearFilters,
    setSorting: reviewsStore.setSorting,
    setPage: reviewsStore.setPage,

    fetchReviews: reviewsStore.fetchReviews,
    fetchReviewById: reviewsStore.fetchReviewById,
    getPublicReviews,
    getReviewStats,
    getCiudadesUnicas,
    getProvinciasUnicas,

    generateSlug
  }
}
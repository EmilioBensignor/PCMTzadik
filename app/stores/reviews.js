import { defineStore } from 'pinia'

export const useReviewsStore = defineStore('reviews', {
  state: () => ({
    reviews: [],
    currentReview: null,
    loading: false,
    error: null,
    totalPages: 1,
    currentPage: 1,
    totalCount: 0,
    filters: {
      search: '',
      rating: null,
      ciudad: '',
      provincia: ''
    },
    sorting: {
      field: 'created_at',
      direction: 'desc'
    }
  }),

  getters: {
    getReviewById: (state) => (id) => {
      return state.reviews.find(review => review.id === id)
    },

    getReviewsByRating: (state) => (rating) => {
      return state.reviews.filter(review => review.rating === rating)
    },

    getReviewsByCiudad: (state) => (ciudad) => {
      return state.reviews.filter(review => 
        review.ciudad.toLowerCase().includes(ciudad.toLowerCase())
      )
    },

    getAverageRating: (state) => {
      if (state.reviews.length === 0) return 0
      
      const sum = state.reviews.reduce((acc, review) => acc + review.rating, 0)
      return (sum / state.reviews.length).toFixed(1)
    },

    getRatingDistribution: (state) => {
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      
      state.reviews.forEach(review => {
        distribution[Math.floor(review.rating)]++
      })
      
      return distribution
    }
  },

  actions: {
    async fetchReviews(options = {}) {
      this.loading = true
      this.error = null

      try {
        const {
          page = this.currentPage,
          limit = 10,
          includeInactive = false
        } = options

        let query = useSupabaseClient()
          .from('reviews')
          .select('*', { count: 'exact' })


        if (this.filters.search) {
          query = query.or(`titulo.ilike.%${this.filters.search}%,autor.ilike.%${this.filters.search}%,comentario.ilike.%${this.filters.search}%`)
        }

        if (this.filters.rating) {
          query = query.eq('rating', this.filters.rating)
        }

        if (this.filters.ciudad) {
          query = query.ilike('ciudad', `%${this.filters.ciudad}%`)
        }

        if (this.filters.provincia) {
          query = query.ilike('provincia', `%${this.filters.provincia}%`)
        }

        // Aplicar ordenamiento
        query = query.order(this.sorting.field, { 
          ascending: this.sorting.direction === 'asc' 
        })

        const from = (page - 1) * limit
        const to = from + limit - 1
        query = query.range(from, to)

        const { data, error, count } = await query

        if (error) throw error

        this.reviews = data || []
        this.totalCount = count || 0
        this.totalPages = Math.ceil(this.totalCount / limit)
        this.currentPage = page

      } catch (error) {
        console.error('Error fetching reviews:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchReviewById(id) {
      this.loading = true
      this.error = null

      try {
        const { data, error } = await useSupabaseClient()
          .from('reviews')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error

        this.currentReview = data
        return data

      } catch (error) {
        console.error('Error fetching review:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async createReview(reviewData) {
      this.loading = true
      this.error = null

      try {
        const { data, error } = await useSupabaseClient()
          .from('reviews')
          .insert(reviewData)
          .select()
          .single()

        if (error) throw error

        this.reviews.unshift(data)
        this.totalCount++

        return data

      } catch (error) {
        console.error('Error creating review:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateReview(id, reviewData) {
      this.loading = true
      this.error = null

      try {
        const { data, error } = await useSupabaseClient()
          .from('reviews')
          .update(reviewData)
          .eq('id', id)
          .select()
          .single()

        if (error) throw error

        const index = this.reviews.findIndex(review => review.id === id)
        if (index !== -1) {
          this.reviews[index] = data
        }

        if (this.currentReview?.id === id) {
          this.currentReview = data
        }

        return data

      } catch (error) {
        console.error('Error updating review:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteReview(id) {
      this.loading = true
      this.error = null

      try {
        const { error } = await useSupabaseClient()
          .from('reviews')
          .delete()
          .eq('id', id)

        if (error) throw error

        this.reviews = this.reviews.filter(review => review.id !== id)
        this.totalCount--

        if (this.currentReview?.id === id) {
          this.currentReview = null
        }

      } catch (error) {
        console.error('Error deleting review:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async toggleReviewStatus(id) {
      const review = this.getReviewById(id)
      if (!review) return

      return await this.updateReview(id, { activo: !review.activo })
    },

    setFilter(key, value) {
      this.filters[key] = value
      this.currentPage = 1
    },

    clearFilters() {
      this.filters = {
        search: '',
        rating: null,
        ciudad: '',
        provincia: ''
      }
      this.currentPage = 1
    },

    setSorting(field, direction = 'desc') {
      this.sorting = { field, direction }
      this.currentPage = 1
    },

    setPage(page) {
      this.currentPage = page
    }
  }
})
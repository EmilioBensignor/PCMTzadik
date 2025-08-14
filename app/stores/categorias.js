import { defineStore } from 'pinia'

export const useCategoriasStore = defineStore('categorias', () => {
  // Estado
  const categorias = ref([])
  const subcategorias = ref([])
  const categoriaCampos = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const getCategoriaById = computed(() => (id) => {
    return categorias.value.find(cat => cat.id === id)
  })

  const getSubcategoriasPorCategoria = computed(() => (categoriaId) => {
    return subcategorias.value.filter(sub => sub.categoria_id === categoriaId)
  })

  const getCamposPorCategoria = computed(() => (categoriaId) => {
    return categoriaCampos.value.filter(campo => campo.categoria_id === categoriaId)
  })

  // Actions
  const fetchCategorias = async () => {
    try {
      loading.value = true
      error.value = null
      
      const supabase = useSupabaseClient()
      const { data, error: err } = await supabase
        .from('categorias')
        .select('*')
        .order('id')
      
      if (err) throw err
      categorias.value = data || []
    } catch (err) {
      error.value = err.message
      console.error('Error fetching categorias:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchSubcategorias = async (categoriaId = null) => {
    try {
      loading.value = true
      error.value = null
      
      const supabase = useSupabaseClient()
      let query = supabase
        .from('subcategorias')
        .select('*')
        .order('nombre')
      
      if (categoriaId) {
        query = query.eq('categoria_id', categoriaId)
      }
      
      const { data, error: err } = await query
      
      if (err) throw err
      
      if (categoriaId) {
        // Si estamos cargando subcategorías de una categoría específica,
        // reemplazar solo las de esa categoría
        const otherSubs = subcategorias.value.filter(sub => sub.categoria_id !== categoriaId)
        subcategorias.value = [...otherSubs, ...(data || [])]
      } else {
        // Si estamos cargando todas, reemplazar completamente
        subcategorias.value = data || []
      }
    } catch (err) {
      error.value = err.message
      console.error('Error fetching subcategorias:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchCategoriaCampos = async (categoriaId = null) => {
    try {
      loading.value = true
      error.value = null
      
      const supabase = useSupabaseClient()
      let query = supabase
        .from('categoria_campos')
        .select('*')
        .order('orden')
      
      if (categoriaId) {
        query = query.eq('categoria_id', categoriaId)
      }
      
      const { data, error: err } = await query
      
      if (err) throw err
      categoriaCampos.value = data || []
    } catch (err) {
      error.value = err.message
      console.error('Error fetching categoria campos:', err)
    } finally {
      loading.value = false
    }
  }

  const createCategoria = async (categoriaData) => {
    try {
      loading.value = true
      error.value = null
      
      const supabase = useSupabaseClient()
      const { data, error: err } = await supabase
        .from('categorias')
        .insert(categoriaData)
        .select()
        .single()
      
      if (err) throw err
      
      categorias.value.push(data)
      return data
    } catch (err) {
      error.value = err.message
      console.error('Error creating categoria:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateCategoria = async (id, categoriaData) => {
    try {
      loading.value = true
      error.value = null
      
      const supabase = useSupabaseClient()
      const { data, error: err } = await supabase
        .from('categorias')
        .update(categoriaData)
        .eq('id', id)
        .select()
        .single()
      
      if (err) throw err
      
      const index = categorias.value.findIndex(cat => cat.id === id)
      if (index !== -1) {
        categorias.value[index] = data
      }
      
      return data
    } catch (err) {
      error.value = err.message
      console.error('Error updating categoria:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteCategoria = async (id) => {
    try {
      loading.value = true
      error.value = null
      
      const supabase = useSupabaseClient()
      const { error: err } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id)
      
      if (err) throw err
      
      categorias.value = categorias.value.filter(cat => cat.id !== id)
    } catch (err) {
      error.value = err.message
      console.error('Error deleting categoria:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createSubcategoria = async (subcategoriaData) => {
    try {
      loading.value = true
      error.value = null
      
      const supabase = useSupabaseClient()
      const { data, error: err } = await supabase
        .from('subcategorias')
        .insert(subcategoriaData)
        .select()
        .single()
      
      if (err) throw err
      
      subcategorias.value.push(data)
      return data
    } catch (err) {
      error.value = err.message
      console.error('Error creating subcategoria:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateSubcategoria = async (id, subcategoriaData) => {
    try {
      loading.value = true
      error.value = null
      
      const supabase = useSupabaseClient()
      const { data, error: err } = await supabase
        .from('subcategorias')
        .update(subcategoriaData)
        .eq('id', id)
        .select()
        .single()
      
      if (err) throw err
      
      const index = subcategorias.value.findIndex(sub => sub.id === id)
      if (index !== -1) {
        subcategorias.value[index] = data
      }
      
      return data
    } catch (err) {
      error.value = err.message
      console.error('Error updating subcategoria:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteSubcategoria = async (id) => {
    try {
      loading.value = true
      error.value = null
      
      const supabase = useSupabaseClient()
      const { error: err } = await supabase
        .from('subcategorias')
        .delete()
        .eq('id', id)
      
      if (err) throw err
      
      subcategorias.value = subcategorias.value.filter(sub => sub.id !== id)
    } catch (err) {
      error.value = err.message
      console.error('Error deleting subcategoria:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createCategoriaCampo = async (campoData) => {
    try {
      loading.value = true
      error.value = null
      
      const supabase = useSupabaseClient()
      const { data, error: err } = await supabase
        .from('categoria_campos')
        .insert(campoData)
        .select()
        .single()
      
      if (err) throw err
      
      categoriaCampos.value.push(data)
      return data
    } catch (err) {
      error.value = err.message
      console.error('Error creating categoria campo:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateCategoriaCampo = async (id, campoData) => {
    try {
      loading.value = true
      error.value = null
      
      const supabase = useSupabaseClient()
      const { data, error: err } = await supabase
        .from('categoria_campos')
        .update(campoData)
        .eq('id', id)
        .select()
        .single()
      
      if (err) throw err
      
      const index = categoriaCampos.value.findIndex(campo => campo.id === id)
      if (index !== -1) {
        categoriaCampos.value[index] = data
      }
      
      return data
    } catch (err) {
      error.value = err.message
      console.error('Error updating categoria campo:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteCategoriaCampo = async (id) => {
    try {
      loading.value = true
      error.value = null
      
      const supabase = useSupabaseClient()
      const { error: err } = await supabase
        .from('categoria_campos')
        .delete()
        .eq('id', id)
      
      if (err) throw err
      
      categoriaCampos.value = categoriaCampos.value.filter(campo => campo.id !== id)
    } catch (err) {
      error.value = err.message
      console.error('Error deleting categoria campo:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Función helper para cargar todos los datos de una categoría
  const loadCategoriaCompleta = async (categoriaId) => {
    await Promise.all([
      fetchCategoriaCampos(categoriaId),
      fetchSubcategorias(categoriaId)
    ])
  }

  return {
    // Estado
    categorias,
    subcategorias,
    categoriaCampos,
    loading,
    error,
    
    // Getters
    getCategoriaById,
    getSubcategoriasPorCategoria,
    getCamposPorCategoria,
    
    // Actions
    fetchCategorias,
    fetchSubcategorias,
    fetchCategoriaCampos,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    createSubcategoria,
    updateSubcategoria,
    deleteSubcategoria,
    createCategoriaCampo,
    updateCategoriaCampo,
    deleteCategoriaCampo,
    loadCategoriaCompleta
  }
})
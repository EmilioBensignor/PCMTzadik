import { useCategoriasStore } from '~/stores/categorias'

export const useCategorias = () => {
  const categoriasStore = useCategoriasStore()
  
  const categorias = computed(() => categoriasStore.categorias)
  const subcategorias = computed(() => categoriasStore.subcategorias)
  const categoriaCampos = computed(() => categoriasStore.categoriaCampos)
  const loading = computed(() => categoriasStore.loading)
  const error = computed(() => categoriasStore.error)
  
  const getCategoriaById = (id) => categoriasStore.getCategoriaById(id)
  const getSubcategoriasPorCategoria = (categoriaId) => categoriasStore.getSubcategoriasPorCategoria(categoriaId)
  const getCamposPorCategoria = (categoriaId) => categoriasStore.getCamposPorCategoria(categoriaId)
  
  const generateFormFields = (categoriaId) => {
    const campos = getCamposPorCategoria(categoriaId)
    
    return campos
      .filter(campo => campo.activo !== false)
      .map(campo => ({
        id: campo.nombre_campo,
        label: campo.label,
        type: campo.tipo,
        required: campo.requerido,
        placeholder: campo.placeholder || '',
        options: campo.opciones ? (typeof campo.opciones === 'string' ? JSON.parse(campo.opciones) : campo.opciones) : [],
        validations: campo.validaciones || {},
        orden: campo.orden
      }))
      .sort((a, b) => a.orden - b.orden)
  }
  
  const validateDynamicData = (categoriaId, datos) => {
    const campos = getCamposPorCategoria(categoriaId)
    const errors = {}
    
    campos
      .filter(campo => campo.activo !== false)
      .forEach(campo => {
        const value = datos[campo.nombre_campo]
        
        if (campo.requerido && (!value || value === '')) {
          errors[campo.nombre_campo] = `${campo.label} es requerido`
          return
        }
        
        if (value && value !== '') {
          switch (campo.tipo) {
            case 'number':
              if (isNaN(value)) {
                errors[campo.nombre_campo] = `${campo.label} debe ser un número`
              }
              break
            case 'email':
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
              if (!emailRegex.test(value)) {
                errors[campo.nombre_campo] = `${campo.label} debe ser un email válido`
              }
              break
            case 'url':
              try {
                new URL(value)
              } catch {
                errors[campo.nombre_campo] = `${campo.label} debe ser una URL válida`
              }
              break
          }
          
          if (campo.validaciones) {
            if (campo.validaciones.min && parseFloat(value) < campo.validaciones.min) {
              errors[campo.nombre_campo] = `${campo.label} debe ser mayor a ${campo.validaciones.min}`
            }
            if (campo.validaciones.max && parseFloat(value) > campo.validaciones.max) {
              errors[campo.nombre_campo] = `${campo.label} debe ser menor a ${campo.validaciones.max}`
            }
            if (campo.validaciones.minLength && value.length < campo.validaciones.minLength) {
              errors[campo.nombre_campo] = `${campo.label} debe tener al menos ${campo.validaciones.minLength} caracteres`
            }
            if (campo.validaciones.maxLength && value.length > campo.validaciones.maxLength) {
              errors[campo.nombre_campo] = `${campo.label} debe tener máximo ${campo.validaciones.maxLength} caracteres`
            }
          }
        }
      })
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }
  
  const formatFieldValue = (campo, value) => {
    if (!value) return '-'
    
    switch (campo.tipo) {
      case 'currency':
        return new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0
        }).format(value)
      case 'number':
        return new Intl.NumberFormat('es-CO').format(value)
      case 'date':
        return new Date(value).toLocaleDateString('es-CO')
      case 'boolean':
        return value ? 'Sí' : 'No'
      default:
        return value
    }
  }
  
  const getDynamicFilterOptions = (categoriaId, fieldName, productos) => {
    const campo = getCamposPorCategoria(categoriaId).find(c => c.nombre_campo === fieldName)
    
    if (!campo) return []
    
    if (campo.opciones && campo.opciones.length > 0) {
      return campo.opciones.map(opt => ({
        value: opt,
        label: opt
      }))
    }
    
    const uniqueValues = new Set()
    productos.forEach(producto => {
      const value = producto.datos_dinamicos?.[fieldName]
      if (value) {
        uniqueValues.add(value)
      }
    })
    
    return Array.from(uniqueValues).map(value => ({
      value,
      label: formatFieldValue(campo, value)
    }))
  }
  
  const initializeCategoria = async (categoriaId) => {
    try {
      await categoriasStore.loadCategoriaCompleta(categoriaId)
      return {
        categoria: getCategoriaById(categoriaId),
        subcategorias: getSubcategoriasPorCategoria(categoriaId),
        campos: getCamposPorCategoria(categoriaId),
        formFields: generateFormFields(categoriaId)
      }
    } catch (error) {
      console.error('Error initializing categoria:', error)
      throw error
    }
  }
  
  return {
    categorias,
    subcategorias,
    categoriaCampos,
    loading,
    error,
    
    getCategoriaById,
    getSubcategoriasPorCategoria,
    getCamposPorCategoria,
    
    fetchCategorias: categoriasStore.fetchCategorias,
    fetchSubcategorias: categoriasStore.fetchSubcategorias,
    fetchCategoriaCampos: categoriasStore.fetchCategoriaCampos,
    createCategoria: categoriasStore.createCategoria,
    updateCategoria: categoriasStore.updateCategoria,
    deleteCategoria: categoriasStore.deleteCategoria,
    createSubcategoria: categoriasStore.createSubcategoria,
    updateSubcategoria: categoriasStore.updateSubcategoria,
    deleteSubcategoria: categoriasStore.deleteSubcategoria,
    createCategoriaCampo: categoriasStore.createCategoriaCampo,
    updateCategoriaCampo: categoriasStore.updateCategoriaCampo,
    deleteCategoriaCampo: categoriasStore.deleteCategoriaCampo,
    loadCategoriaCompleta: categoriasStore.loadCategoriaCompleta,
    
    generateFormFields,
    validateDynamicData,
    formatFieldValue,
    getDynamicFilterOptions,
    initializeCategoria
  }
}
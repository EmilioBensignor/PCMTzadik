const categorias = [
    {
        nombre: 'Tractores',
        icon: "truck",
        subcategorias: ["Agrícolas", "De Cadenas", "De Ruedas"],
        columns: [
            { label: 'Título', type: 'text', required: true },
            { label: 'Marca', type: 'text', required: true },
            { label: 'Condición', type: 'text', required: true },
            { label: 'Modelo', type: 'text', required: true },
            { label: 'Año de Fabricación', type: 'number' },
            { label: 'Línea', type: 'text' },
            { label: 'Potencia HP', type: 'number', required: true },
            { label: 'Tracción', type: 'text' },
            { label: 'Dirección', type: 'text' },
            { label: 'Tipo de Motor', type: 'text' },
            { label: 'Levante 3 puntos', type: 'text', required: true },
            { label: 'Cabina', type: 'text' },
            { label: 'Tipo de tractor', type: 'text' },
            { label: 'Descripción larga', type: 'textarea', required: true },
            { label: 'Descripción corta', type: 'textarea' },
            { label: 'Precio', type: 'currency', required: true },
            { label: 'Oferta', type: 'currency' },
            { label: 'Imágenes', type: 'image', required: true },
            { label: 'Video', type: 'iframe' }
        ]
    },
    {
        nombre: 'Pala cargadora',
        icon: "truck",
        subcategorias: ["Frontal", "Compacta", "De Orugas", "De Orugas", "De Orugas", "De Orugas"],
        columns: [
            { label: 'Título', type: 'text', required: true },
            { label: 'Marca', type: 'text', required: true },
            { label: 'Condición', type: 'text', required: true },
            { label: 'Modelo', type: 'text', required: true },
            { label: 'Año de Fabricación', type: 'number' },
            { label: 'Capacidad balde m3', type: 'number', required: true },
            { label: 'Descripción larga', type: 'textarea', required: true },
            { label: 'Descripción corta', type: 'textarea' },
            { label: 'Precio', type: 'currency', required: true },
            { label: 'Oferta', type: 'currency' },
            { label: 'Imágenes', type: 'image', required: true },
            { label: 'Video', type: 'iframe' }
        ]
    },
    {
        nombre: 'Línea Logística',
        icon: "truck",
        subcategorias: [],
        columns: [
            { label: 'Título', type: 'text', required: true },
            { label: 'Marca', type: 'text', required: true },
            { label: 'Condición', type: 'text', required: true },
            { label: 'Modelo', type: 'text', required: true },
            { label: 'Año de Fabricación', type: 'number' },
            { label: 'Potencia HP', type: 'number' },
            { label: 'Capacidad (tn)', type: 'number', required: true },
            { label: 'Tipo de Motor', type: 'text', required: true },
            { label: 'Sistema de Transmisión', type: 'text' },
            { label: 'Altura de elevación (m)', type: 'number', required: true },
            { label: 'Torre de elevación', type: 'text' },
            { label: 'Descripción larga', type: 'textarea', required: true },
            { label: 'Descripción corta', type: 'textarea' },
            { label: 'Precio', type: 'currency', required: true },
            { label: 'Oferta', type: 'currency' },
            { label: 'Imágenes', type: 'image', required: true },
            { label: 'Video', type: 'iframe' }
        ]
    },
    {
        nombre: 'Maquinaría Vial',
        icon: "truck",
        subcategorias: [],
        columns: [
            { label: 'Título', type: 'text', required: true },
            { label: 'Marca', type: 'text', required: true },
            { label: 'Condición', type: 'text', required: true },
            { label: 'Modelo', type: 'text', required: true },
            { label: 'Año de Fabricación', type: 'number' },
            { label: 'Potencia HP', type: 'number', required: true },
            { label: 'Capacidad de Carga', type: 'number' },
            { label: 'Peso Operativo (kg)', type: 'number', required: true },
            { label: 'Descripción larga', type: 'textarea', required: true },
            { label: 'Descripción corta', type: 'textarea' },
            { label: 'Precio', type: 'currency', required: true },
            { label: 'Oferta', type: 'currency' },
            { label: 'Imágenes', type: 'image', required: true },
            { label: 'Video', type: 'iframe' }
        ]
    },
    {
        nombre: 'Maquinaría Agrícola',
        icon: "truck",
        subcategorias: [],
        columns: [
            { label: 'Título', type: 'text', required: true },
            { label: 'Marca', type: 'text', required: true },
            { label: 'Condición', type: 'text', required: true },
            { label: 'Modelo', type: 'text', required: true },
            { label: 'Año de Fabricación', type: 'number' },
            { label: 'Potencia HP', type: 'number' },
            { label: 'Cultivo / Uso', type: 'text' },
            { label: 'Tipo de Plataforma Incluida', type: 'text' },
            { label: 'Sistema de Cosecha', type: 'text' },
            { label: 'Ancho de Labor', type: 'number' },
            { label: 'Capacidad de la Tolva (L)', type: 'number' },
            { label: 'Descarga por Segundo', type: 'number' },
            { label: 'Tipo de Grano', type: 'text' },
            { label: 'Distancia entre Surcos (cm)', type: 'number' },
            { label: 'Ancho de trabajo (m)', type: 'number' },
            { label: 'Cantidad de Tolvas', type: 'number' },
            { label: 'Características del Chasis', type: 'text' },
            { label: 'Sistema de labranza', type: 'text' },
            { label: 'Sistema de Siembra', type: 'text' },
            { label: 'Cantidad de Surcos', type: 'number' },
            { label: 'Cantidad del Depósito', type: 'number' },
            { label: 'Descripción larga', type: 'textarea', required: true },
            { label: 'Descripción corta', type: 'textarea' },
            { label: 'Precio', type: 'currency', required: true },
            { label: 'Oferta', type: 'currency' },
            { label: 'Imágenes', type: 'image', required: true },
            { label: 'Video', type: 'iframe' }
        ]
    },
    {
        nombre: 'Implementos',
        icon: "truck",
        subcategorias: [],
        columns: [
            { label: 'Título', type: 'text', required: true },
            { label: 'Marca', type: 'text', required: true },
            { label: 'Condición', type: 'text', required: true },
            { label: 'Modelo', type: 'text', required: true },
            { label: 'Año de Fabricación', type: 'number'},
            { label: 'Cultivo / Uso', type: 'text'},
            { label: 'Ancho de Labor', type: 'number' },
            { label: 'Tipo de Enganche', type: 'text', required: true },
            { label: 'Potencia Requerida', type: 'number' },
            { label: 'Precio', type: 'currency', required: true },
            { label: 'Oferta', type: 'currency' },
            { label: 'Imágenes', type: 'image', required: true },
            { label: 'Video', type: 'iframe' }
        ]
    },
    {
        nombre: 'Ferretería',
        icon: "truck",
        subcategorias: [],
        columns: [
            { label: 'Título', type: 'text', required: true },
            { label: 'Condición', type: 'text', required: true },
            { label: 'Precio', type: 'currency', required: true },
            { label: 'Potencia', type: 'text' },
            { label: 'Motor', type: 'text' },
            { label: 'Arranque', type: 'text' },
            { label: 'Peso', type: 'number' },
            { label: 'Uso', type: 'text' },
            { label: 'Oferta', type: 'currency' },
            { label: 'Imágenes', type: 'image', required: true },
            { label: 'Video', type: 'iframe' }
        ]
    },
    {
        nombre: 'Productos Especiales',
        icon: "truck",
        subcategorias: [],
        columns: [
            { label: 'Título', type: 'text', required: true },
            { label: 'Condición', type: 'text', required: true },
            { label: 'Precio', type: 'currency', required: true },
            { label: 'Descripción Larga', type: 'textarea', required: true },
            { label: 'Descripción Corta', type: 'textarea'},
            { label: 'Oferta', type: 'currency'},
            { label: 'Imágenes', type: 'image', required: true },
            { label: 'Video', type: 'iframe' }
        ]
    }
];

export default categorias;

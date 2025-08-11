const productos = [
    // Tractores
    {
        id: 1,
        categoria: 'Tractores',
        titulo: 'Tractor John Deere 6120M',
        marca: 'John Deere',
        condicion: 'Usado',
        modelo: '6120M',
        anoFabricacion: 2018,
        linea: 'Serie 6M',
        potenciaHP: 120,
        traccion: '4x4',
        direccion: 'Hidráulica',
        tipoMotor: 'Diésel 4 cilindros turbo',
        levante3Puntos: 'Sí',
        cabina: 'Cabina cerrada con A/C',
        tipotractor: 'Agrícola',
        descripcionLarga: 'Tractor John Deere 6120M en excelente estado, ideal para trabajos agrícolas medianos. Motor PowerTech de 4 cilindros con turbocompresor, transmisión PowrReverser de 20 velocidades. Sistema hidráulico de alta capacidad.',
        descripcionCorta: 'Tractor JD 6120M, 4x4, cabina A/C, excelente estado',
        precio: 45000000,
        imagenes: ['/images/Placeholder.png']
    },
    {
        id: 2,
        categoria: 'Tractores',
        titulo: 'Tractor Massey Ferguson 4275',
        marca: 'Massey Ferguson',
        condicion: 'Seminuevo',
        modelo: '4275',
        anoFabricacion: 2020,
        potenciaHP: 75,
        traccion: '4x2',
        direccion: 'Mecánica asistida',
        tipoMotor: 'Diésel 3 cilindros',
        levante3Puntos: 'Sí',
        cabina: 'ROPS',
        tipotractor: 'Utilitario',
        descripcionLarga: 'Tractor compacto ideal para propiedades pequeñas y medianas. Motor AGCO Power de 3 cilindros, transmisión sincronizada de 12 velocidades. Perfecto para trabajos de jardinería y agricultura liviana.',
        descripcionCorta: 'MF 4275, compacto, ideal para propiedades medianas',
        precio: 28000000,
        imagenes: ['/images/Placeholder.png']
    },

    // Pala cargadora
    {
        id: 3,
        categoria: 'Pala cargadora',
        titulo: 'Pala Cargadora Caterpillar 950H',
        marca: 'Caterpillar',
        condicion: 'Usado',
        modelo: '950H',
        anoFabricacion: 2016,
        capacidadBalde: 2.6,
        descripcionLarga: 'Pala cargadora de ruedas CAT 950H con motor C7 ACERT, transmisión automática de 4 velocidades. Ideal para movimiento de tierras, carga de camiones y trabajos de construcción pesada.',
        descripcionCorta: 'CAT 950H, motor C7, transmisión automática',
        precio: 85000000,
        imagenes: ['/images/Placeholder.png']
    },

    // Línea Logística
    {
        id: 4,
        categoria: 'Línea Logística',
        titulo: 'Montacargas Toyota 8FGU25',
        marca: 'Toyota',
        condicion: 'Usado',
        modelo: '8FGU25',
        anoFabricacion: 2019,
        potenciaHP: 52,
        capacidadTn: 2.5,
        tipoMotor: 'GLP',
        sistemaTransmision: 'Automático',
        alturaElevacion: 4.5,
        torreElevacion: 'Dúplex',
        descripcionLarga: 'Montacargas Toyota 8FGU25 con motor a gas, sistema SAS (Sistema de Estabilidad Activa), transmisión automática. Perfecto para almacenes y centros de distribución.',
        descripcionCorta: 'Toyota 8FGU25, 2.5tn, motor GLP, SAS',
        precio: 38000000,
        imagenes: ['/images/Placeholder.png']
    },

    // Maquinaria Vial
    {
        id: 5,
        categoria: 'Maquinaría Vial',
        titulo: 'Motoniveladora Caterpillar 140M',
        marca: 'Caterpillar',
        condicion: 'Seminuevo',
        modelo: '140M',
        anoFabricacion: 2021,
        potenciaHP: 173,
        capacidadCarga: 8000,
        pesoOperativo: 16500,
        descripcionLarga: 'Motoniveladora CAT 140M con motor C7.1 ACERT, transmisión powershift de 6 velocidades hacia adelante y 3 hacia atrás. Sistema de control de inclinación automático.',
        descripcionCorta: 'CAT 140M, motor C7.1, control automático',
        precio: 180000000,
        imagenes: ['/images/Placeholder.png']
    },

    // Maquinaria Agrícola
    {
        id: 6,
        categoria: 'Maquinaría Agrícola',
        titulo: 'Cosechadora John Deere S660',
        marca: 'John Deere',
        condicion: 'Usado',
        modelo: 'S660',
        anoFabricacion: 2017,
        potenciaHP: 292,
        cultivoUso: 'Soja, maíz, trigo',
        tipoPlataforma: 'Plataforma draper 625D',
        sistemaCosecha: 'Rotor axial',
        anchoLabor: 7.6,
        capacidadTolva: 10600,
        descargaSegundo: 135,
        tipoGrano: 'Cereales y oleaginosas',
        descripcionLarga: 'Cosechadora John Deere S660 con motor PowerTech Plus de 6 cilindros, sistema de limpieza de doble ventilador, cabina ComfortView. Incluye plataforma draper 625D.',
        descripcionCorta: 'JD S660, rotor axial, plataforma 625D incluida',
        precio: 220000000,
        imagenes: ['/images/Placeholder.png']
    },
    {
        id: 7,
        categoria: 'Maquinaría Agrícola',
        titulo: 'Sembradora Crucianelli Air Drill 9000',
        marca: 'Crucianelli',
        condicion: 'Seminuevo',
        modelo: 'Air Drill 9000',
        anoFabricacion: 2020,
        cultivoUso: 'Soja, trigo, avena',
        anchoTrabajo: 9,
        distanciaEntreSurcos: 17.5,
        cantidadSurcos: 51,
        sistemaSiembra: 'Neumático',
        cantidadTolvas: 3,
        cantidadDeposito: 9000,
        descripcionLarga: 'Sembradora neumática Crucianelli Air Drill con 51 surcos a 17.5cm, sistema de dosificación neumático, monitor de siembra ISOBUS. Incluye kit de fertilización.',
        descripcionCorta: 'Crucianelli Air Drill, 51 surcos, sistema neumático',
        precio: 65000000,
        imagenes: ['/images/Placeholder.png']
    },

    // Implementos
    {
        id: 8,
        categoria: 'Implementos',
        titulo: 'Arado de Discos Agrometal 3x24',
        marca: 'Agrometal',
        condicion: 'Usado',
        modelo: '3x24',
        anoFabricacion: 2019,
        cultivoUso: 'Preparación de suelos',
        anchoLabor: 2.4,
        tipoEnganche: '3 puntos categoría II',
        potenciaRequerida: 80,
        precio: 8500000,
        imagenes: ['/images/Placeholder.png']
    },
    {
        id: 9,
        categoria: 'Implementos',
        titulo: 'Rastra de Discos Tandem 24 Discos',
        marca: 'Metalfor',
        condicion: 'Nuevo',
        modelo: 'TD-24',
        anoFabricacion: 2023,
        cultivoUso: 'Laboreo secundario',
        anchoLabor: 3.0,
        tipoEnganche: 'Tiro',
        potenciaRequerida: 100,
        precio: 12000000,
        imagenes: ['/images/Placeholder.png']
    },

    // Ferretería
    {
        id: 10,
        categoria: 'Ferretería',
        titulo: 'Generador Honda EU3000iS',
        marca: 'Honda',
        condicion: 'Nuevo',
        precio: 2800000,
        potencia: '3000W',
        motor: 'GX160 4 tiempos',
        arranque: 'Eléctrico y manual',
        peso: 34,
        uso: 'Portátil silencioso',
        imagenes: ['/images/Placeholder.png']
    },
    {
        id: 11,
        categoria: 'Ferretería',
        titulo: 'Soldadora Inverter ESAB 200A',
        marca: 'ESAB',
        condicion: 'Seminuevo',
        precio: 1200000,
        potencia: '200A',
        arranque: 'Automático',
        peso: 4.5,
        uso: 'Soldadura de electrodos y TIG',
        imagenes: ['/images/Placeholder.png']
    },

    // Productos Especiales
    {
        id: 12,
        categoria: 'Productos Especiales',
        titulo: 'Sistema de Riego por Aspersión 50 Hectáreas',
        condicion: 'Nuevo',
        precio: 45000000,
        descripcionLarga: 'Sistema completo de riego por aspersión para 50 hectáreas, incluye bomba centrífuga de 15HP, tuberías de PVC, aspersores de impacto, válvulas de control automático y sistema de filtrado. Ideal para cultivos extensivos.',
        descripcionCorta: 'Sistema riego 50ha, bomba 15HP, aspersores automáticos',
        imagenes: ['/images/Placeholder.png']
    }
];

export default productos;
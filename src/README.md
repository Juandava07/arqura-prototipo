# Arqura - Estructura Modular

## 📁 Estructura del Proyecto

```
prototipo/
├── index.html              # Punto de entrada HTML
├── styles.css              # Estilos globales
├── app.js                  # Aplicación principal (monolítico - aún en uso)
├── assets/                 # Recursos estáticos
│   ├── hero/              # Imágenes del carrusel
│   ├── products/          # Imágenes de productos
│   └── placeholder.jpg    # Imagen por defecto
├── src/                    # Código fuente modular (NUEVO)
│   ├── config/
│   │   ├── constants.js   # Constantes globales
│   │   └── firebase.js    # Configuración de Firebase
│   ├── core/
│   │   ├── auth.js        # Sistema de autenticación
│   │   ├── state.js       # Estado global
│   │   └── helpers.js     # (Existente)
│   ├── stores/
│   │   ├── settings.store.js  # Configuración general
│   │   ├── about.store.js     # Contenido "Acerca de"
│   │   ├── products.store.js  # Gestión de productos
│   │   └── orders.store.js    # Gestión de pedidos
│   ├── components/
│   │   └── whatsapp-fab.js    # Botón flotante WhatsApp
│   ├── services/
│   │   └── ai-recommendations.js  # Algoritmo de recomendaciones
│   └── utils/
│       ├── dom.js         # Utilidades del DOM
│       ├── time.js        # Utilidades de tiempo
│       ├── images.js      # Manejo de imágenes
│       └── ui-effects.js  # Efectos visuales

└── data/                   # Datos y archivos auxiliares
```

## 🚀 Estado Actual

### ✅ Completado (Fases 1-4)
- **Config**: Firebase, constantes
- **Core**: Autenticación, estado (parcial)
- **Stores**: Settings, About, Products, Orders
- **Utils**: DOM, tiempo, imágenes, efectos UI
- **Components**: WhatsApp FAB
- **Services**: AI Recommendations (SophIA)

**Total: 14 módulos extraídos y documentados**

### ⏳ Pendiente (Fase 5 - Opcional)
- Integración completa con ES6 modules
- Actualización de index.html
- Refactorización de app.js para usar imports
- Testing exhaustivo de la integración

## 📝 Notas Importantes

### Estado de Transición
- **`app.js` sigue siendo el archivo principal** y contiene toda la lógica funcional
- Los módulos en `src/` son **extractos preparados** para futura integración
- **No se requiere cambio en index.html** por ahora
- La aplicación funciona **exactamente igual** que antes

### Próximos Pasos para Integración Completa

1. **Convertir a ES6 Modules**:
   ```html
   <!-- En index.html -->
   <script type="module" src="src/app.js"></script>
   ```

2. **Importar módulos en app.js**:
   ```javascript
   import { $, toast, go } from './utils/dom.js';
   import SettingsStore from './stores/settings.store.js';
   // ... etc
   ```

3. **Eliminar código duplicado** del app.js original

4. **Probar exhaustivamente** cada integración

## 🎯 Beneficios de la Nueva Estructura

- ✅ **Mantenibilidad**: Código organizado por responsabilidad
- ✅ **Reutilización**: Módulos independientes y testables
- ✅ **Escalabilidad**: Fácil añadir nuevas funcionalidades
- ✅ **Colaboración**: Múltiples desarrolladores pueden trabajar en paralelo
- ✅ **Testing**: Cada módulo puede probarse de forma aislada

## 📚 Documentación de Módulos

### Utils
- **dom.js**: Selectores, toast notifications, navegación
- **time.js**: Manejo de zona horaria Colombia
- **images.js**: Fallback de imágenes, generación de rutas
- **ui-effects.js**: Confetti, fondo de mármol

### Stores
- **settings.store.js**: Configuración de la app (WhatsApp, email, carousel)
- **about.store.js**: Contenido de la página "Acerca de"
- **products.store.js**: CRUD de productos
- **orders.store.js**: CRUD de pedidos

---

**Nota**: Esta es una refactorización incremental. El código original permanece intacto y funcional mientras se prepara la migración gradual.

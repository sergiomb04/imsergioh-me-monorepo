# Guía de Contribución 🤝

¡Gracias por tu interés en contribuir a este proyecto!

## Cómo contribuir

1. **Haz un Fork** del repositorio.
2. **Crea una rama** para tu funcionalidad o corrección:
   ```bash
   git checkout -b feat/mi-nueva-funcionalidad
   ```
   o para correcciones de errores:
   ```bash
   git checkout -b fix/nombre-del-bug
   ```
3. **Realiza tus cambios** y comprueba que cumplan los estándares de código:
   - Ejecuta `npm run lint` para asegurarte de que no haya errores de linting.
   - Ejecuta `npm run build` para comprobar que la compilación funciona correctamente.
4. **Haz commit** de tus cambios usando mensajes claros y descriptivos (siguiendo Conventional Commits si es posible):
   ```bash
   git commit -m "feat: agregar soporte para vista previa de enlaces con metadatos extendidos"
   ```
5. **Haz push** a tu fork:
   ```bash
   git push origin feat/mi-nueva-funcionalidad
   ```
6. **Abre un Pull Request** describiendo detalladamente los cambios realizados.

## Estándares de Código

- Usa componentes funcionales y hooks de React.
- Respeta la arquitectura de carpetas (`src/component`, `src/features`, `src/lib`).
- No introduzcas credenciales, claves API o URLs de prueba hardcodeadas; utiliza variables de entorno y documenta cualquier variable nueva en `.env.example`.
- Mantén la accesibilidad y el rendimiento web en mente.

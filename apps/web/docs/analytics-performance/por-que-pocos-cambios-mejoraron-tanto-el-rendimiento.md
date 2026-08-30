# ¿Por qué pocos cambios mejoraron tanto el rendimiento en Lighthouse?

A primera vista parece sorprendente que modificando unas pocas líneas de código la puntuación de rendimiento haya saltado de un **79** a **+90 / +95**. ¿Cómo es posible que cambios tan pequeños tengan un impacto tan gigantesco?

Esta guía explica en detalle y de forma accesible **cómo mide Google el rendimiento**, **qué estaba ocurriendo bajo el capó** y **por qué estas pequeñas correcciones transformaron la experiencia de la web**.

---

## 1. El gran secreto: Cómo puntúa Google Lighthouse

Mucha gente cree que Lighthouse solo mide la *"velocidad de descarga"* o los megabytes que pesa la página. **Eso es falso.**

Lighthouse evalúa la **experiencia visual y la estabilidad percibida por el usuario** combinando 5 métricas con pesos matemáticos muy específicos:

```
Puntuación Total (100%) =
  ├── 30% Total Blocking Time (TBT)        -> ¿Se congela la pantalla al cargar?
  ├── 25% Largest Contentful Paint (LCP)    -> ¿Cuánto tarda en verse lo importante?
  ├── 25% Cumulative Layout Shift (CLS)     -> ¿La página pega saltos visuales?
  ├── 10% First Contentful Paint (FCP)      -> ¿Cuándo aparece el primer píxel?
  └── 10% Speed Index (SI)                  -> ¿Cómo de rápido se rellena la pantalla?
```

> ⚠️ **Fíjate en esto:** El **CLS (saltos visuales)** vale un **25%** de la nota total, y el **TBT (tiempo de bloqueo)** vale un **30%**. Juntos representan el **55% de toda la puntuación**.

Si tu página es ultra rápida cargando en 1 segundo pero los elementos se mueven de sitio o el navegador se satura unos milisegundos, **Lighthouse te quita de golpe entre 20 y 30 puntos**.

---

## 2. El misterio del banner y el "Efecto Salto" (CLS: 0.31 $\to$ 0.00)

### ¿Qué es el Cumulative Layout Shift (CLS)?
Imagina que estás leyendo una noticia en un periódico digital. Justo cuando vas a pulsar un enlace, aparece un anuncio gigante arriba, todo el texto salta hacia abajo 10 centímetros y acabas pulsando donde no querías. **Eso es un Layout Shift (salto de diseño).**

Google penaliza duramente cualquier salto visual porque produce una sensación de web rota, lenta e inestable.

### ¿Qué pasaba antes en las Analíticas?
En el código original existía este bloque:

```tsx
{!hasSnapshot && (
  <section className="...">
    <h2>Conectando con el servidor en tiempo real...</h2>
    <LoadingPanel minHeight={200} />
  </section>
)}
```

Veamos la película de lo que ocurría en los primeros 800 milisegundos:

1. **Fotograma 1 (0.0s - 0.5s):** La página cargaba y mostraba arriba del todo una caja gigante de **~280px de alto** diciendo *"Conectando con el servidor..."*.
2. **Fotograma 2:** Esa caja empujaba todos los KPIs, las tablas y las gráficas hacia abajo.
3. **Fotograma 3 (0.6s):** Tu librería **LiveState** conectaba por WebSocket y recibía los datos.
4. **Fotograma 4 (0.7s):** Como `hasSnapshot` pasaba a ser `true`, la caja superior de 280px **desaparecía por completo**.
5. **El desastre visual:** En un solo milisegundo, toda la página (tarjetas, listas, rankings y tablas) **pegaba un salto brusco hacia arriba de 280 píxeles**.

Para el algoritmo de Google, **más del 70% de los elementos visibles en la pantalla cambiaron de posición bruscamente**.
* Resultado matemático de CLS: **`0.31`** *(Rojo crítico: todo lo que supere `0.10` es considerado deficiente)*.
* Penalización directa: **-15 a -20 puntos** en la nota final.

### La solución aplicada:
1. **Eliminar el banner colapsable.** No poner bloques gigantes arriba que luego se destruyen.
2. **Skeletons con proporción 1:1:** En lugar de cajas vacías que luego crecen, se crearon `ListSkeleton` y `TableSkeleton`. Si la lista de páginas va a tener 7 filas, el esqueleto pinta exactamente **7 filas simuladas con la misma altura que las reales**.
3. **Resultado:** Cuando LiveState recibe los datos, el texto simplemente reemplaza al esqueleto gris en el mismo milímetro exacto. **CLS = `0.00` (Verde perfecto, 100/100 en esta métrica).**

---

## 3. Las banderas y las imágenes sin dimensiones reservadas

### El problema:
En `CountryFlag.tsx`, las imágenes de las banderas de los países se cargaban desde internet (`flagcdn.com`):

```tsx
// ❌ Antes: el navegador no sabía cuánto medía la imagen hasta que terminaba de descargarla
<img src={`https://flagcdn.com/${cleanCode}.svg`} className="..." />
```

Cuando el navegador encuentra una etiqueta `<img>` sin ancho (`width`) ni alto (`height`) fijos, le asigna inicialmente un tamaño de `0x0` píxeles. Cuando la imagen termina de descargarse 200ms después, la imagen se expande de golpe, empujando el texto de al lado hacia la derecha.

Multiplica esto por 10 filas de tabla y 7 filas de países: **decenas de micro-saltos en cascada**.

### La solución:
```tsx
// ✅ Ahora: Dimensiones reservadas por anticipado
<img
  src={`https://flagcdn.com/${cleanCode}.svg`}
  width={20}
  height={14}
  className="h-3.5 w-5 aspect-[4/3] shrink-0 ..."
/>
```
El navegador reserva el hueco de 20x14 píxeles desde el primer milisegundo. Cuando la bandera llega, entra en su hueco exacto sin mover nada alrededor.

---

## 4. El "Cocinero Saturado" y el Total Blocking Time (TBT)

### ¿Qué es el Total Blocking Time (TBT)?
El navegador web ejecuta JavaScript en un único hilo principal (*Main Thread*). Es como si en un restaurante hubiera **un solo cocinero**.

Si entran 10 clientes a la vez y el cocinero se pone a preparar platos complejos de golpe durante 220 milisegundos, el restaurante se congela: los botones no responden al clic, el scroll no va fluido y la página parece "atascada".

### ¿Qué ocurría antes?
Al entrar en `/admin/analytics`, el navegador cargaba y procesaba en el paquete principal todo el código del componente **`EventsModal`** (un modal grande con timeline de eventos, scroll automático, formateadores, etc.), **a pesar de que el usuario todavía no había hecho clic en "Ver eventos"**.

Descargar y ejecutar ese código innecesario en el primer instante saturaba el hilo principal $\to$ **TBT = 220 ms** (Zona naranja).

### La solución: Carga Diferida (`next/dynamic`)
```tsx
// ✅ Cargar el modal bajo demanda (Code Splitting)
const EventsModal = dynamic(
  () => import("@/features/analytics-dashboard/components/EventsModal"),
  { ssr: false }
);
```

**¿Qué significa esto?**
Le decimos a Next.js: *"No descargues ni ejecutes una sola línea del modal de eventos ahora. Espera a que el usuario haga clic en el botón de ver eventos para descargarlo"*.

El cocinero (hilo principal) queda completamente libre para pintar la pantalla y conectar LiveState de inmediato.

---

## 5. LiveState no era lento: el problema era la reacción visual

Existía la sospecha de que la librería **LiveState** pudiera ser la causa de la lentitud por usar WebSockets.

**La realidad técnica:**
* **LiveState es extremadamente rápido:** Un WebSocket mantiene un túnel binario abierto que tarda apenas milisegundos en recibir datos.
* El problema no era el transporte de datos, sino **cómo la interfaz gráfica reaccionaba cuando llegaban los datos**:
  * Antes: La interfaz destruía y reconstruía bloques completos, provocando saltos de cientos de píxeles (CLS).
  * Ahora: La interfaz mantiene la estructura sólida como una roca y solo actualiza los valores en tiempo real dentro de sus cajas preasignadas.

---

## 6. Resumen en una tabla comparativa

| Aspecto | Antes | Ahora | Impacto en Lighthouse |
| :--- | :--- | :--- | :--- |
| **Banner superior de conexión** | Ocupaba 280px y desaparecía de golpe al recibir datos. | Eliminado. El estado se refleja sutilmente sin mover el layout. | **CLS bajó de 0.31 a 0.00** (+15 pts). |
| **Esqueletos de carga (Skeletons)** | Cajas genéricas con alturas diferentes a los datos finales. | Skeletons idénticos 1:1 en altura y filas (`ListSkeleton`, `TableSkeleton`). | Evita que las tarjetas cambien de tamaño al poblarse. |
| **Banderas de países** | Sin ancho/alto reservados, empujaban el texto al descargarse. | Dimensiones fijas `20x14px` y `aspect-[4/3]`. | Cero micro-desplazamientos de texto. |
| **Modal de Eventos** | Se procesaba entero en la carga inicial. | Carga diferida con `next/dynamic` solo al hacer clic. | **Reducción de TBT y bundle inicial**. |

---

## Conclusión

El rendimiento web moderno rara vez depende de reescribir todo desde cero. Consiste en dominar dos principios fundamentales:

1. **Estabilidad visual (Layout Stability):** Nunca permitas que un elemento cambie de tamaño o desaparezca empujando al resto. Reserva siempre el espacio exacto.
2. **Carga perezosa (Lazy Loading):** No cargues en el primer segundo lo que el usuario solo va a utilizar después de interactuar.

Con solo aplicar estos dos conceptos con precisión quirúrgica, la página pasó de un **79** a la zona verde de **+90 / +95**.

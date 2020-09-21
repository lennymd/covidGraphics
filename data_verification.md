# Verificación de datos

1. No hay ninguna lineas vaciás en el archivo csv.
2. Asegurar que todas las columnas tengan los nombre correcto. Para la data de america latina en vez de `state_short` estoy usando `country_short`. Seria buena idea mirar bien rectificar las columnas de la data corriente antes de hacer una actualizacion.
3. Los días están formateado como: YYYY-MM-DD
4. Para la data del promedio del país, los variables `state_short` y `state_name` deberían ser `Nacional`.
5. Para la data del promedio del país, los variables relacionados a rankings deberían estar vacíos.
6. Para data de México, el valor de `state_short` para `Quintana Roo` debería ser `QRoo` y no `Q.Roo`. Con el estado `Edo.Mex.` el `state_short` debería ser también `EdoMex`. La idea es que no deberían haber `.` en el variable `state_short` porque daña la interactividad del gráfico.
7. Data sobre Brasil debería tener `Brasil` como valor de `country`.
8. El archivo csv se debería llamar `data_latest.csv` y estar en la carpeta de `data` del repositorio. Si después rompemos la data de países en diferentes archivos, podemos cambiar esto.

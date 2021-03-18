## Índice de adopción de políticas públicas

¿Qué es un índice de políticas públicas? Es una medida de cuántas políticas públicas ha adoptado un país para controlar la pandemia. Cuanto mayor es el número, más políticas ha adoptado un país. Nuestro índice se basa en un índice creado por la Universidad de Oxford. Hacemos un seguimiento de 9 políticas públicas destinadas a ayudar a controlar la pandemia. Estas políticas incluyen el cierre de escuelas y negocios no esenciales, y pedidos para quedarse en casa, entre otras políticas. Las medidas se ponderan en función de la fecha en que se implementaron y el tiempo que llevan implementadas. La línea punteada negra representa el promedio ponderado de todos los estados del país.

```
indexLineChart({
  country: 'argentina',
  yVariable: 'policy_index',
  yRank: 'ranking_policy_accumulated',
  useBaseline: false,
  usePercentage: false,
  chartKeyword: 'policy',
});
```

```
<div class="row">
<div class="col-md-3">
<div class="lenny_stateContainer" id="stateContainer_policy">
<div id="stateWrapper_policy" class="lenny_stateWrapper">
<ul id="stateList_policy"></ul>
</div>
</div>
</div>
<div class="col-md-9">
<figure id="wrapper_policy" class="lenny_chartWrapper">
<!-- start tooltip -->
<div id="tooltip_policy" class="lenny_chartTooltip">
<div id="tooltipHeader_policy" class="lenny_tooltipHeader">
  <span></span>
</div>
<table id="tooltipContent_policy">
<tr></tr>
</table>
</div>
<!-- end tooltip -->
</figure>
</div>
</div>
```

<hr />

## Cambio en el índice de movilidad en porcentaje, en comparación con la movilidad habitual

Estimaciones basadas en datos de Google. Estos gráficos muestran el cambio en la movilidad de la población en cada estado, en comparación con la movilidad habitual en el mismo período de tiempo (identificado como la línea de base 0). Una disminución en la movilidad también podría disminuir la probabilidad de propagación de la comunidad. La línea punteada negra representa el promedio ponderado de todos los estados del país.

```
indexLineChart({
  country: 'argentina',
  yVariable: 'mobility_index',
  yRank: 'ranking_mobility_accumulated',
  useBaseline: true,
  usePercentage: true,
  chartKeyword: 'mobility',
});
```

```
<div class="row">
<div class="col-md-3">
<div class="lenny_stateContainer" id="stateContainer_mobility">
<div id="stateWrapper_mobility" class="lenny_stateWrapper">
<ul id="stateList_mobility"></ul>
</div>
</div>
</div>
<div class="col-md-9">
<figure id="wrapper_mobility" class="lenny_chartWrapper">
<!-- start tooltip -->
<div id="tooltip_mobility" class="lenny_chartTooltip">
<div id="tooltipHeader_mobility" class="lenny_tooltipHeader">
<span></span>
</div>
<table id="tooltipContent_mobility">
<tr></tr>
</table>
</div>
<!-- end tooltip -->
</figure>
</div>
</div>
```

<hr />

## Uso de mascarillas

Índice de la directiva de política de salud pública sobre el uso de mascarillas, ajustado por el día de implementación en comparación con el registro del primer caso en el país. La línea punteada negra representa el promedio ponderado de todos los estados del país.

```
indexLineChart({
country: 'argentina',
yVariable: 'facemask_index',
yRank: 'ranking_facemask',
useBaseline: false,
usePercentage: false,
chartKeyword: 'facemask',
});
```

```
<div class="row">
<div class="col-md-3">
<div class="lenny_stateContainer" id="stateContainer_facemask">
<div id="stateWrapper_facemask" class="lenny_stateWrapper">
<ul id="stateList_facemask"></ul>
</div>
</div>
</div>
<div class="col-md-9">
<figure id="wrapper_facemask" class="lenny_chartWrapper">
<!-- start tooltip -->
<div id="tooltip_facemask" class="lenny_chartTooltip">
<div id="tooltipHeader_facemask" class="lenny_tooltipHeader">
<span></span>
</div>
<table id="tooltipContent_facemask">
<tr></tr>
</table>
</div>
<!-- end tooltip -->
</figure>
</div>
</div>
```

## Public Policy Adoption Index

What is a Public Policy Index? It’s a measure of how many public policies a country has adopted to control the pandemic. The higher the number, the more policies a country has adopted. Our index is based on an index created by Oxford University. We track 9 public policies intended to help control the pandemic. These policies include the closing of schools and non-essential businesses, and stay-at-home orders, among other policies. Measures are weighted based on the date when they were implemented, and on how long they’ve been in place. The black dashed line represents the weighted average of all the states in the country.

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

## Changes in mobility

Estimates based on Google data. These graphics show the change in population mobility in each state, compared to the usual mobility in the same time period (identified as the 0 baseline.) A decrease in mobility might also decrease the likelihood of community spread. The black dashed line represents the weighted average of all the states in the country.

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

## Use of face masks

Index of the public health policy directive on the use of face masks, adjusted for the day of implementation compared to the registration of the first case in the country. The black dashed line represents the weighted average of all the states in the country.

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

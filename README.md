# Graphics for COVID-19 Observatory

This repo contains development code for charts related to [this COVID-19 project](http://observcovid.miami.edu/).

## indexLineChart()

For the various indices and rates being graphed, I consolidated different charts into one function that covers all their use cases: `indexLineChart()`. This function takes the following object argument,

```javascript
{
  country: 'mexico',
  yVariable: 'policy_index',
  yRank: 'ranking_policy_accumulated',
  useBaseline: false,
  usePercentage: false,
  chartKeyword: 'policy',
}
```

This object can be modified for each use case.

I'm now working on a version of this chart that works with latin America data.

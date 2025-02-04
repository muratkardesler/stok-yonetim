<template>
  <div class="relative w-full h-full">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import Chart from 'chart.js/auto'

export default {
  name: 'LineChart',
  props: {
    data: {
      type: Array,
      required: true
    }
  },
  setup(props) {
    const chartRef = ref(null)
    let chart = null

    const createChart = () => {
      const ctx = chartRef.value.getContext('2d')
      
      if (chart) {
        chart.destroy()
      }

      chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: props.data.map(item => item.month),
          datasets: [{
            label: 'Satış Tutarı',
            data: props.data.map(item => item.amount),
            borderColor: '#4F46E5',
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              callbacks: {
                label: (context) => {
                  const value = context.raw
                  return '₺' + value.toLocaleString('tr-TR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => {
                  return '₺' + value.toLocaleString('tr-TR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })
                }
              }
            }
          },
          interaction: {
            intersect: false,
            mode: 'index'
          }
        }
      })
    }

    watch(() => props.data, () => {
      createChart()
    }, { deep: true })

    onMounted(() => {
      createChart()
    })

    onUnmounted(() => {
      if (chart) {
        chart.destroy()
      }
    })

    return {
      chartRef
    }
  }
}
</script> 
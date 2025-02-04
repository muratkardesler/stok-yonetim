<template>
  <div class="relative w-full h-full">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import Chart from 'chart.js/auto'

export default {
  name: 'PieChart',
  props: {
    data: {
      type: Array,
      required: true
    }
  },
  setup(props) {
    const chartRef = ref(null)
    let chart = null

    const colors = [
      '#4F46E5', // Primary
      '#10B981', // Success
      '#F59E0B', // Warning
      '#EF4444', // Error
      '#8B5CF6', // Purple
      '#EC4899', // Pink
      '#06B6D4', // Cyan
      '#14B8A6'  // Teal
    ]

    const createChart = () => {
      const ctx = chartRef.value.getContext('2d')
      
      if (chart) {
        chart.destroy()
      }

      chart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: props.data.map(item => item.name),
          datasets: [{
            data: props.data.map(item => item.value),
            backgroundColor: colors.slice(0, props.data.length),
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                padding: 20,
                usePointStyle: true,
                pointStyle: 'circle'
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const value = context.raw
                  const total = context.dataset.data.reduce((a, b) => a + b, 0)
                  const percentage = ((value / total) * 100).toFixed(1)
                  return context.label + ': ' + value + ' adet (' + percentage + '%)'
                }
              }
            }
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
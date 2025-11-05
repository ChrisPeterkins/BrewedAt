<template>
  <div class="dashboard">
    <h2>Database Statistics</h2>
    <p class="dashboard-info">Visual overview of your database</p>

    <div v-if="loading" class="loading">Loading statistics...</div>

    <div v-else class="dashboard-grid">
      <!-- Table Counts -->
      <div class="stat-card">
        <h3> Table Records</h3>
        <div class="chart-container">
          <Bar :data="tableCountsData" :options="chartOptions" />
        </div>
      </div>

      <!-- Events by Type -->
      <div class="stat-card">
        <h3> Events by Type</h3>
        <div class="chart-container">
          <Doughnut v-if="eventTypesData" :data="eventTypesData" :options="doughnutOptions" />
          <div v-else class="empty-chart">No event data</div>
        </div>
      </div>

      <!-- Featured Content -->
      <div class="stat-card">
        <h3> Featured Content</h3>
        <div class="stats-list">
          <div class="stat-item">
            <span class="stat-label">Featured Events</span>
            <span class="stat-value">{{ stats.featuredEvents }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Featured Podcasts</span>
            <span class="stat-value">{{ stats.featuredPodcasts }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Active Raffles</span>
            <span class="stat-value">{{ stats.activeRaffles }}</span>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="stat-card">
        <h3> Recent Activity</h3>
        <div class="stats-list">
          <div class="stat-item">
            <span class="stat-label">Contact Submissions (7d)</span>
            <span class="stat-value">{{ stats.recentContacts }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Raffle Entries (7d)</span>
            <span class="stat-value">{{ stats.recentEntries }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Total Users</span>
            <span class="stat-value">{{ stats.totalUsers }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Bar, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement)

export default {
  name: 'Dashboard',
  components: {
    Bar,
    Doughnut
  },
  props: {
    token: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      loading: true,
      stats: {
        featuredEvents: 0,
        featuredPodcasts: 0,
        activeRaffles: 0,
        recentContacts: 0,
        recentEntries: 0,
        totalUsers: 0
      },
      tableCounts: {},
      eventTypes: {},
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      },
      doughnutOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    }
  },
  computed: {
    tableCountsData() {
      const labels = Object.keys(this.tableCounts)
      const data = Object.values(this.tableCounts)

      return {
        labels: labels.map(l => l.replace(/_/g, ' ')),
        datasets: [{
          label: 'Records',
          data: data,
          backgroundColor: [
            '#fd5526',
            '#1f3540',
            '#25303d',
            '#e64d20',
            '#2d4752',
            '#f76f4a',
            '#36495a'
          ]
        }]
      }
    },
    eventTypesData() {
      if (Object.keys(this.eventTypes).length === 0) return null

      const labels = Object.keys(this.eventTypes)
      const data = Object.values(this.eventTypes)

      return {
        labels: labels.map(l => l || 'Unknown'),
        datasets: [{
          data: data,
          backgroundColor: [
            '#fd5526',
            '#1f3540',
            '#25303d',
            '#e64d20',
            '#2d4752',
            '#f76f4a'
          ]
        }]
      }
    }
  },
  mounted() {
    this.loadStatistics()
  },
  methods: {
    async loadStatistics() {
      this.loading = true

      try {
        // Load table counts
        await this.loadTableCounts()

        // Load featured content counts
        await this.loadFeaturedCounts()

        // Load event types distribution
        await this.loadEventTypes()

        // Load recent activity
        await this.loadRecentActivity()
      } catch (error) {
        console.error('Error loading statistics:', error)
      } finally {
        this.loading = false
      }
    },
    async loadTableCounts() {
      const tables = ['events', 'podcast_episodes', 'raffles', 'raffle_entries', 'contact_submissions', 'users']
      const endpoints = {
        'events': 'events',
        'podcast_episodes': 'podcast',
        'raffles': 'raffles',
        'raffle_entries': 'raffles',
        'contact_submissions': 'contact',
        'users': null
      }

      for (const table of tables) {
        const endpoint = endpoints[table]
        if (endpoint) {
          try {
            const response = await fetch(`/brewedat/api/${endpoint}`, {
              headers: { 'Authorization': `Bearer ${this.token}` }
            })
            const result = await response.json()
            if (result.success && result.data) {
              this.tableCounts[table] = Array.isArray(result.data) ? result.data.length : 0
            }
          } catch (err) {
            console.error(`Error loading ${table}:`, err)
          }
        }
      }
    },
    async loadFeaturedCounts() {
      // Featured events
      try {
        const response = await fetch('/brewedat/api/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          },
          body: JSON.stringify({ sql: 'SELECT COUNT(*) as count FROM events WHERE featured = 1' })
        })
        const result = await response.json()
        if (result.success && result.data[0]) {
          this.stats.featuredEvents = result.data[0].count
        }
      } catch (err) {
        console.error('Error loading featured events:', err)
      }

      // Featured podcasts
      try {
        const response = await fetch('/brewedat/api/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          },
          body: JSON.stringify({ sql: 'SELECT COUNT(*) as count FROM podcast_episodes WHERE featured = 1' })
        })
        const result = await response.json()
        if (result.success && result.data[0]) {
          this.stats.featuredPodcasts = result.data[0].count
        }
      } catch (err) {
        console.error('Error loading featured podcasts:', err)
      }

      // Active raffles
      try {
        const response = await fetch('/brewedat/api/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          },
          body: JSON.stringify({ sql: 'SELECT COUNT(*) as count FROM raffles WHERE active = 1' })
        })
        const result = await response.json()
        if (result.success && result.data[0]) {
          this.stats.activeRaffles = result.data[0].count
        }
      } catch (err) {
        console.error('Error loading active raffles:', err)
      }
    },
    async loadEventTypes() {
      try {
        const response = await fetch('/brewedat/api/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          },
          body: JSON.stringify({ sql: 'SELECT eventType, COUNT(*) as count FROM events GROUP BY eventType' })
        })
        const result = await response.json()
        if (result.success && result.data) {
          this.eventTypes = {}
          result.data.forEach(row => {
            this.eventTypes[row.eventType || 'Unknown'] = row.count
          })
        }
      } catch (err) {
        console.error('Error loading event types:', err)
      }
    },
    async loadRecentActivity() {
      // Recent contacts (last 7 days)
      try {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        const response = await fetch('/brewedat/api/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          },
          body: JSON.stringify({ sql: `SELECT COUNT(*) as count FROM contact_submissions WHERE submittedAt >= '${sevenDaysAgo}'` })
        })
        const result = await response.json()
        if (result.success && result.data[0]) {
          this.stats.recentContacts = result.data[0].count
        }
      } catch (err) {
        console.error('Error loading recent contacts:', err)
      }

      // Recent raffle entries (last 7 days)
      try {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        const response = await fetch('/brewedat/api/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          },
          body: JSON.stringify({ sql: `SELECT COUNT(*) as count FROM raffle_entries WHERE submittedAt >= '${sevenDaysAgo}'` })
        })
        const result = await response.json()
        if (result.success && result.data[0]) {
          this.stats.recentEntries = result.data[0].count
        }
      } catch (err) {
        console.error('Error loading recent entries:', err)
      }

      // Total users
      try {
        const response = await fetch('/brewedat/api/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          },
          body: JSON.stringify({ sql: 'SELECT COUNT(*) as count FROM users' })
        })
        const result = await response.json()
        if (result.success && result.data[0]) {
          this.stats.totalUsers = result.data[0].count
        }
      } catch (err) {
        console.error('Error loading total users:', err)
      }
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 0;
  font-family: 'Poppins', sans-serif;
}

.dashboard h2 {
  margin-bottom: 0.5rem;
  color: #1f3540;
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
}

.dashboard-info {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 2rem;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
}

.stat-card h3 {
  margin: 0 0 1rem 0;
  color: #1f3540;
  font-size: 1.1rem;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
}

.chart-container {
  height: 250px;
  position: relative;
}

.empty-chart {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-style: italic;
}

.stats-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #fd5526;
  font-family: 'Poppins', sans-serif;
}
</style>

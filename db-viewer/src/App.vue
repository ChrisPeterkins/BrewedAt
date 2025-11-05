<template>
  <div class="app">
    <!-- Show login if not authenticated -->
    <Login v-if="!isAuthenticated" @login-success="handleLoginSuccess" />

    <!-- Show main app if authenticated -->
    <template v-else>
      <header class="header">
        <div class="header-content">
          <div>
            <h1>BrewedAt Database Viewer</h1>
            <p>Explore your SQLite database</p>
          </div>
          <div class="user-section">
            <span class="user-email">{{ user?.email }}</span>
            <button @click="handleLogout" class="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <div class="container">
        <div class="sidebar">
          <button
            @click="showDashboard"
            :class="{ active: showDashboardTab }"
            class="table-btn dashboard-btn"
          >
            <ChartBarIcon class="btn-icon" />
            Dashboard
          </button>

          <div class="sidebar-divider"></div>

          <h3>Tables</h3>
          <div class="table-list">
            <button
              v-for="table in tables"
              :key="table"
              @click="selectTable(table)"
              :class="{ active: selectedTable === table && !showQueryTab && !showDashboardTab }"
              class="table-btn"
            >
              {{ table }}
              <span v-if="tableCounts[table]" class="count">{{ tableCounts[table] }}</span>
            </button>
          </div>

          <div class="sidebar-divider"></div>

          <button
            @click="showCustomQuery"
            :class="{ active: showQueryTab }"
            class="table-btn query-btn"
          >
            <CommandLineIcon class="btn-icon" />
            Custom SQL Query
          </button>
        </div>

        <div class="main-content">
          <!-- Dashboard Tab -->
          <Dashboard v-if="showDashboardTab" :token="token" />

          <!-- Custom SQL Query Tab -->
          <div v-else-if="showQueryTab" class="query-view">
            <h2>Custom SQL Query</h2>
            <p class="query-info">Write and execute custom SELECT queries (read-only)</p>

            <div class="query-editor">
              <textarea
                v-model="customSql"
                placeholder="SELECT * FROM events WHERE featured = 1 LIMIT 10"
                class="sql-textarea"
              ></textarea>

              <div class="query-actions">
                <button @click="executeQuery" class="execute-btn" :disabled="!customSql || queryLoading">
                  {{ queryLoading ? '⏳ Executing...' : '▶️ Execute Query' }}
                </button>
                <button @click="clearQuery" class="clear-btn" :disabled="!customSql && !queryData.length">
                  🗑️ Clear
                </button>
              </div>

              <div v-if="queryError" class="error">{{ queryError }}</div>
            </div>

            <div v-if="queryData.length > 0" class="query-results">
              <div class="table-header">
                <h3>Results ({{ queryData.length }} rows)</h3>
                <div class="actions">
                  <button @click="exportQueryAsCSV" class="export-btn">📥 CSV</button>
                  <button @click="exportQueryAsJSON" class="export-btn">📥 JSON</button>
                </div>
              </div>

              <div class="table-wrapper">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th v-for="column in queryColumns" :key="column">{{ column }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, index) in queryData" :key="index">
                      <td v-for="column in queryColumns" :key="column">
                        <div class="cell-content">{{ formatValue(row[column]) }}</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div v-else-if="!queryLoading && !queryError" class="empty">
              Enter a SQL query above and click Execute to see results
            </div>
          </div>

          <!-- Table View -->
          <div v-else-if="selectedTable" class="table-view">
            <div class="table-header">
              <h2>{{ selectedTable }}</h2>
              <div class="actions">
                <input
                  v-model="searchQuery"
                  @input="fetchData"
                  type="text"
                  placeholder="Search..."
                  class="search-input"
                />
                <button @click="fetchData" class="refresh-btn">
                  <ArrowPathIcon class="btn-icon" />
                  Refresh
                </button>
                <button @click="exportAsCSV" class="export-btn" :disabled="data.length === 0">CSV</button>
                <button @click="exportAsJSON" class="export-btn" :disabled="data.length === 0">JSON</button>
              </div>
            </div>

            <div v-if="loading" class="loading">Loading...</div>

            <div v-else-if="error" class="error">{{ error }}</div>

            <div v-else-if="data.length === 0" class="empty">
              No data found
            </div>

            <div v-else class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th v-for="column in columns" :key="column">{{ column }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in data" :key="index">
                    <td v-for="column in columns" :key="column">
                      <div class="cell-content">{{ formatValue(row[column]) }}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="pagination">
              <span>Showing {{ data.length }} of {{ tableCounts[selectedTable] || 0 }} records</span>
            </div>
          </div>

          <div v-else class="welcome">
            <h2>👈 Select a table to view data</h2>
            <p>Choose from the list on the left to explore your database</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import Login from './components/Login.vue'
import Dashboard from './components/Dashboard.vue'
import { ChartBarIcon, CommandLineIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'

export default {
  components: {
    Login,
    Dashboard,
    ChartBarIcon,
    CommandLineIcon,
    ArrowPathIcon
  },
  data() {
    return {
      isAuthenticated: false,
      token: null,
      user: null,
      tables: ['events', 'podcast_episodes', 'raffles', 'raffle_entries', 'contact_submissions', 'site_config', 'users'],
      selectedTable: null,
      data: [],
      columns: [],
      tableCounts: {},
      loading: false,
      error: null,
      searchQuery: '',
      showDashboardTab: true,
      showQueryTab: false,
      customSql: '',
      queryData: [],
      queryColumns: [],
      queryLoading: false,
      queryError: null
    }
  },
  mounted() {
    this.checkAuth()
  },
  methods: {
    checkAuth() {
      // Check if user is already logged in
      const token = localStorage.getItem('token')
      const userStr = localStorage.getItem('user')

      if (token && userStr) {
        this.token = token
        this.user = JSON.parse(userStr)
        this.isAuthenticated = true
        this.loadTableCounts()
      }
    },
    handleLoginSuccess({ token, user }) {
      this.token = token
      this.user = user
      this.isAuthenticated = true
      this.loadTableCounts()
    },
    handleLogout() {
      // Clear auth state
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.token = null
      this.user = null
      this.isAuthenticated = false
      this.selectedTable = null
      this.data = []
      this.tableCounts = {}
    },
    async loadTableCounts() {
      // Load counts for all tables
      for (const table of this.tables) {
        try {
          const endpoint = this.getEndpoint(table)
          if (endpoint) {
            const response = await fetch(`/brewedat/api/${endpoint}`, {
              headers: {
                'Authorization': `Bearer ${this.token}`
              }
            })
            const result = await response.json()
            if (result.success && result.data) {
              this.tableCounts[table] = Array.isArray(result.data) ? result.data.length : 0
            }
          }
        } catch (err) {
          console.error(`Error loading count for ${table}:`, err)
        }
      }
    },
    showDashboard() {
      this.showDashboardTab = true
      this.showQueryTab = false
      this.selectedTable = null
    },
    selectTable(table) {
      this.selectedTable = table
      this.searchQuery = ''
      this.showQueryTab = false
      this.showDashboardTab = false
      this.fetchData()
    },
    showCustomQuery() {
      this.showQueryTab = true
      this.showDashboardTab = false
      this.selectedTable = null
    },
    async executeQuery() {
      if (!this.customSql) return

      this.queryLoading = true
      this.queryError = null

      try {
        const response = await fetch('/brewedat/api/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          },
          body: JSON.stringify({ sql: this.customSql })
        })

        const result = await response.json()

        if (result.success && result.data) {
          this.queryData = Array.isArray(result.data) ? result.data : [result.data]

          if (this.queryData.length > 0) {
            this.queryColumns = Object.keys(this.queryData[0])
          } else {
            this.queryColumns = []
          }
        } else {
          this.queryError = result.error || 'Query failed'
          this.queryData = []
          this.queryColumns = []
        }
      } catch (err) {
        this.queryError = err.message
        this.queryData = []
        this.queryColumns = []
      } finally {
        this.queryLoading = false
      }
    },
    clearQuery() {
      this.customSql = ''
      this.queryData = []
      this.queryColumns = []
      this.queryError = null
    },
    exportQueryAsCSV() {
      if (!this.queryData.length) return

      // Create CSV header
      const headers = this.queryColumns.join(',')

      // Create CSV rows
      const rows = this.queryData.map(row => {
        return this.queryColumns.map(col => {
          let value = row[col]

          if (value === null || value === undefined) {
            return ''
          }

          value = String(value).replace(/"/g, '""')

          if (value.includes(',') || value.includes('\n') || value.includes('"')) {
            return `"${value}"`
          }

          return value
        }).join(',')
      })

      const csv = [headers, ...rows].join('\n')

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)

      link.setAttribute('href', url)
      link.setAttribute('download', `query_results_${new Date().toISOString().slice(0, 10)}.csv`)
      link.style.visibility = 'hidden'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    exportQueryAsJSON() {
      if (!this.queryData.length) return

      const json = JSON.stringify(this.queryData, null, 2)

      const blob = new Blob([json], { type: 'application/json;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)

      link.setAttribute('href', url)
      link.setAttribute('download', `query_results_${new Date().toISOString().slice(0, 10)}.json`)
      link.style.visibility = 'hidden'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    getEndpoint(table) {
      const endpoints = {
        'events': 'events',
        'podcast_episodes': 'podcast',
        'raffles': 'raffles',
        'raffle_entries': 'raffles', // Will need special handling
        'contact_submissions': 'contact',
        'site_config': 'config',
        'users': null // No public endpoint
      }
      return endpoints[table]
    },
    async fetchData() {
      if (!this.selectedTable) return

      this.loading = true
      this.error = null

      try {
        const endpoint = this.getEndpoint(this.selectedTable)

        if (!endpoint) {
          this.error = 'No API endpoint available for this table'
          this.data = []
          this.columns = []
          return
        }

        let url = `/brewedat/api/${endpoint}`
        if (this.searchQuery) {
          url += `?search=${encodeURIComponent(this.searchQuery)}`
        }

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        })
        const result = await response.json()

        if (result.success && result.data) {
          this.data = Array.isArray(result.data) ? result.data : [result.data]

          if (this.data.length > 0) {
            this.columns = Object.keys(this.data[0])
          } else {
            this.columns = []
          }
        } else {
          this.error = result.error || 'Failed to fetch data'
          this.data = []
          this.columns = []
        }
      } catch (err) {
        this.error = err.message
        this.data = []
        this.columns = []
      } finally {
        this.loading = false
      }
    },
    formatValue(value) {
      if (value === null || value === undefined) return '-'
      if (typeof value === 'boolean') return value ? '✓' : '✗'
      if (typeof value === 'string' && value.length > 100) {
        return value.substring(0, 100) + '...'
      }
      return value
    },
    exportAsCSV() {
      if (!this.data.length) return

      // Create CSV header
      const headers = this.columns.join(',')

      // Create CSV rows
      const rows = this.data.map(row => {
        return this.columns.map(col => {
          let value = row[col]

          // Handle null/undefined
          if (value === null || value === undefined) {
            return ''
          }

          // Convert to string and escape quotes
          value = String(value).replace(/"/g, '""')

          // Wrap in quotes if contains comma, newline, or quote
          if (value.includes(',') || value.includes('\n') || value.includes('"')) {
            return `"${value}"`
          }

          return value
        }).join(',')
      })

      // Combine headers and rows
      const csv = [headers, ...rows].join('\n')

      // Create download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)

      link.setAttribute('href', url)
      link.setAttribute('download', `${this.selectedTable}_${new Date().toISOString().slice(0, 10)}.csv`)
      link.style.visibility = 'hidden'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    exportAsJSON() {
      if (!this.data.length) return

      // Create formatted JSON
      const json = JSON.stringify(this.data, null, 2)

      // Create download
      const blob = new Blob([json], { type: 'application/json;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)

      link.setAttribute('href', url)
      link.setAttribute('download', `${this.selectedTable}_${new Date().toISOString().slice(0, 10)}.json`)
      link.style.visibility = 'hidden'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: #f5f5f5;
  font-family: 'Poppins', sans-serif;
}

.header {
  background: linear-gradient(135deg, #1f3540 0%, #25303d 100%);
  color: white;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(31, 53, 64, 0.2);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.header h1 {
  font-size: 2rem;
  margin: 0 0 0.5rem 0;
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
}

.header p {
  opacity: 0.9;
  font-size: 1rem;
  margin: 0;
  font-family: 'Poppins', sans-serif;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-email {
  font-size: 0.9rem;
  opacity: 0.9;
}

.logout-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.container {
  display: flex;
  max-width: 1400px;
  margin: 2rem auto;
  gap: 1rem;
  padding: 0 1rem;
}

.sidebar {
  width: 250px;
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  height: fit-content;
  position: sticky;
  top: 2rem;
}

.sidebar h3 {
  margin-bottom: 1rem;
  color: #1f3540;
  font-size: 1.1rem;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
}

.table-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.table-btn {
  background: #f8f9fa;
  border: 2px solid transparent;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  font-size: 0.95rem;
  transition: all 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-btn:hover {
  background: #e9ecef;
  border-color: #fd5526;
}

.table-btn.active {
  background: #fd5526;
  color: white;
  border-color: #fd5526;
}

.count {
  background: rgba(0,0,0,0.1);
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.85rem;
}

.table-btn.active .count {
  background: rgba(255,255,255,0.2);
}

.main-content {
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.table-header h2 {
  color: #333;
  font-size: 1.5rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.search-input {
  padding: 0.5rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  min-width: 200px;
}

.search-input:focus {
  outline: none;
  border-color: #fd5526;
}

.refresh-btn {
  background: #fd5526;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background 0.2s;
}

.refresh-btn:hover {
  background: #e64d20;
}

.export-btn {
  background: #10b981;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background 0.2s;
}

.export-btn:hover:not(:disabled) {
  background: #059669;
}

.export-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.loading, .error, .empty {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.error {
  color: #e74c3c;
}

.table-wrapper {
  overflow-x: auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: #f8f9fa;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #e0e0e0;
  position: sticky;
  top: 0;
  white-space: nowrap;
}

.data-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.data-table tbody tr:hover {
  background: #f8f9fa;
}

.cell-content {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pagination {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
  color: #666;
  font-size: 0.9rem;
}

.welcome {
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
}

.welcome h2 {
  margin-bottom: 1rem;
  color: #333;
}

/* Icon Styles */
.btn-icon {
  width: 1.25rem;
  height: 1.25rem;
  display: inline-block;
  vertical-align: middle;
  margin-right: 0.5rem;
}

/* Query Tab Styles */
.sidebar-divider {
  border-top: 1px solid #e0e0e0;
  margin: 1rem 0;
}

.dashboard-btn {
  color: #10b981;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.query-btn {
  color: #fd5526;
  font-weight: 600;
}

.query-view {
  padding: 0;
}

.query-view h2 {
  margin-bottom: 0.5rem;
  color: #333;
}

.query-info {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.query-editor {
  margin-bottom: 2rem;
}

.sql-textarea {
  width: 100%;
  min-height: 150px;
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  resize: vertical;
  margin-bottom: 1rem;
}

.sql-textarea:focus {
  outline: none;
  border-color: #fd5526;
}

.query-actions {
  display: flex;
  gap: 0.5rem;
}

.execute-btn {
  background: #fd5526;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: background 0.2s;
}

.execute-btn:hover:not(:disabled) {
  background: #e64d20;
}

.execute-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.clear-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
}

.clear-btn:hover:not(:disabled) {
  background: #dc2626;
}

.clear-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.query-results {
  margin-top: 2rem;
}

.query-results h3 {
  margin: 0;
  color: #333;
}
</style>

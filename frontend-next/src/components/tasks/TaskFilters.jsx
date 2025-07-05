'use client'

import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'

export function TaskFilters({ filters, onFiltersChange }) {
  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
        
        {/* Search */}
        <div className="flex-1 min-w-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search tasks..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          
          {/* Status Filter */}
          <div className="min-w-0">
            <label htmlFor="status-filter" className="sr-only">
              Status
            </label>
            <select
              id="status-filter"
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="min-w-0">
            <label htmlFor="priority-filter" className="sr-only">
              Priority
            </label>
            <select
              id="priority-filter"
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Due Date Filter */}
          <div className="min-w-0">
            <label htmlFor="duedate-filter" className="sr-only">
              Due Date
            </label>
            <select
              id="duedate-filter"
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={filters.dueDate}
              onChange={(e) => handleFilterChange('dueDate', e.target.value)}
            >
              <option value="all">All Dates</option>
              <option value="today">Due Today</option>
              <option value="tomorrow">Due Tomorrow</option>
              <option value="this-week">This Week</option>
              <option value="overdue">Overdue</option>
              <option value="no-date">No Due Date</option>
            </select>
          </div>

          {/* Filter Icon */}
          <div className="flex items-center">
            <FunnelIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(filters.status !== 'all' || filters.priority !== 'all' || filters.dueDate !== 'all' || filters.search) && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-500">Active filters:</span>
          
          {filters.search && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Search: "{filters.search}"
              <button
                type="button"
                className="flex-shrink-0 ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none focus:bg-blue-500 focus:text-white"
                onClick={() => handleFilterChange('search', '')}
              >
                <span className="sr-only">Remove search filter</span>
                <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                  <path strokeLinecap="round" strokeWidth="1.5" d="m1 1 6 6m0-6L1 7" />
                </svg>
              </button>
            </span>
          )}

          {filters.status !== 'all' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Status: {filters.status}
              <button
                type="button"
                className="flex-shrink-0 ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center text-green-400 hover:bg-green-200 hover:text-green-500 focus:outline-none focus:bg-green-500 focus:text-white"
                onClick={() => handleFilterChange('status', 'all')}
              >
                <span className="sr-only">Remove status filter</span>
                <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                  <path strokeLinecap="round" strokeWidth="1.5" d="m1 1 6 6m0-6L1 7" />
                </svg>
              </button>
            </span>
          )}

          {filters.priority !== 'all' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Priority: {filters.priority}
              <button
                type="button"
                className="flex-shrink-0 ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center text-yellow-400 hover:bg-yellow-200 hover:text-yellow-500 focus:outline-none focus:bg-yellow-500 focus:text-white"
                onClick={() => handleFilterChange('priority', 'all')}
              >
                <span className="sr-only">Remove priority filter</span>
                <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                  <path strokeLinecap="round" strokeWidth="1.5" d="m1 1 6 6m0-6L1 7" />
                </svg>
              </button>
            </span>
          )}

          {filters.dueDate !== 'all' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Due: {filters.dueDate}
              <button
                type="button"
                className="flex-shrink-0 ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center text-purple-400 hover:bg-purple-200 hover:text-purple-500 focus:outline-none focus:bg-purple-500 focus:text-white"
                onClick={() => handleFilterChange('dueDate', 'all')}
              >
                <span className="sr-only">Remove due date filter</span>
                <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                  <path strokeLinecap="round" strokeWidth="1.5" d="m1 1 6 6m0-6L1 7" />
                </svg>
              </button>
            </span>
          )}

          <button
            type="button"
            className="text-xs text-gray-500 hover:text-gray-700 underline"
            onClick={() => onFiltersChange({
              status: 'all',
              priority: 'all',
              search: '',
              dueDate: 'all'
            })}
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}

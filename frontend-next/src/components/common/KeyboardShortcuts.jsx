'use client'

import { useEffect } from 'react'

export function useKeyboardShortcuts({ onNewTask, onSearch, onEscape }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Don't trigger shortcuts when typing in inputs
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        if (event.key === 'Escape' && onEscape) {
          onEscape()
        }
        return
      }

      // Ctrl/Cmd + N for new task
      if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault()
        onNewTask?.()
      }

      // Ctrl/Cmd + K for search
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault()
        onSearch?.()
      }

      // Escape key
      if (event.key === 'Escape') {
        onEscape?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onNewTask, onSearch, onEscape])
}

export function KeyboardShortcutsHelp() {
  return (
    <div className="text-xs text-gray-500 mt-2">
      <p>
        <kbd className="px-1 py-0.5 bg-gray-100 rounded">Ctrl+N</kbd> New task •{' '}
        <kbd className="px-1 py-0.5 bg-gray-100 rounded">Ctrl+K</kbd> Search •{' '}
        <kbd className="px-1 py-0.5 bg-gray-100 rounded">Esc</kbd> Close
      </p>
    </div>
  )
}

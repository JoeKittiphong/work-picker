/**
 * IndexedDB storage layer for Work Picker.
 *
 * Database: work-picker-db (v1)
 * Stores:   settings, entries
 *
 * On first load, migrates data from localStorage if present.
 */

const DB_NAME = 'work-picker-db'
const DB_VERSION = 1
const LEGACY_STORAGE_KEY = 'work-picker-payroll-v1'

/* ── Open / upgrade ── */

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings')
      }
      if (!db.objectStoreNames.contains('entries')) {
        db.createObjectStore('entries')
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/* ── Generic helpers ── */

function dbGet(db, storeName, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly')
    const store = tx.objectStore(storeName)
    const request = store.get(key)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function dbPut(db, storeName, key, value) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    const store = tx.objectStore(storeName)
    const request = store.put(value, key)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

/* ── Migration from localStorage ── */

function migrateFromLocalStorage() {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw)
    // Normalize legacy 'holidayOt' type
    if (Array.isArray(parsed.entries)) {
      parsed.entries = parsed.entries.map((entry) => ({
        ...entry,
        type: entry.type === 'holidayOt' ? 'holiday' : entry.type,
      }))
    }
    return parsed
  } catch {
    return null
  }
}

/* ══════════════════════════════════════
   Public API
   ══════════════════════════════════════ */

/**
 * Load settings + entries from IndexedDB.
 * Falls back to localStorage migration on first use.
 */
export async function loadAll(defaultSettings, defaultEntries) {
  try {
    const db = await openDB()

    let settings = await dbGet(db, 'settings', 'current')
    let entries = await dbGet(db, 'entries', 'list')

    // First run: try migrating from localStorage
    if (settings === undefined && entries === undefined) {
      const legacy = migrateFromLocalStorage()

      if (legacy) {
        settings = { ...defaultSettings, ...legacy.settings }
        entries = Array.isArray(legacy.entries) ? legacy.entries : defaultEntries

        // Persist to IndexedDB
        await dbPut(db, 'settings', 'current', settings)
        await dbPut(db, 'entries', 'list', entries)

        // Clean up localStorage
        localStorage.removeItem(LEGACY_STORAGE_KEY)
      }
    }

    db.close()

    return {
      settings: { ...defaultSettings, ...(settings ?? {}) },
      entries: entries ?? defaultEntries,
    }
  } catch (err) {
    console.warn('[DB] loadAll failed, using defaults', err)

    // Final fallback: try localStorage directly
    const legacy = migrateFromLocalStorage()
    if (legacy) {
      return {
        settings: { ...defaultSettings, ...legacy.settings },
        entries: Array.isArray(legacy.entries) ? legacy.entries : defaultEntries,
      }
    }

    return { settings: defaultSettings, entries: defaultEntries }
  }
}

/**
 * Save settings to IndexedDB.
 */
export async function saveSettings(settings) {
  try {
    const db = await openDB()
    await dbPut(db, 'settings', 'current', settings)
    db.close()
  } catch (err) {
    console.warn('[DB] saveSettings failed', err)
  }
}

/**
 * Save entries to IndexedDB.
 */
export async function saveEntries(entries) {
  try {
    const db = await openDB()
    await dbPut(db, 'entries', 'list', entries)
    db.close()
  } catch (err) {
    console.warn('[DB] saveEntries failed', err)
  }
}

/**
 * Save both settings and entries.
 */
export async function saveAll(settings, entries) {
  try {
    const db = await openDB()
    await dbPut(db, 'settings', 'current', settings)
    await dbPut(db, 'entries', 'list', entries)
    db.close()
  } catch (err) {
    console.warn('[DB] saveAll failed', err)
  }
}

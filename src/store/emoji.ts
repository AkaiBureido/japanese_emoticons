import { useCallback, useReducer } from 'react'

export interface EMAppStore {
  loading: boolean
  initialized: boolean
  data?: EMAppStoreData
  error?: any
}

export type EMAppStoreData = {
  [category: string]: {
    [subCategory: string]: {
      url: string
      list: string[]
    }[]
  }
}

export type EMAppStoreActionType = 'init' | 'load-pending' | 'load-done' | 'load-error'

export type EMAppStoreAction = {
  type: EMAppStoreActionType
  payload?: any
}

export type EMAppStoreDispatch = (action: EMAppStoreAction) => void

function initialAppState(): EMAppStore {
  return {
    loading: false,
    initialized: false,
    data: null,
    error: null,
  }
}

function appStateReducer(state: EMAppStore, action: EMAppStoreAction): EMAppStore {
  switch (action.type) {
    case 'init':
      return initialAppState()
    case 'load-pending':
      return {
        ...state,
        loading: true,
        initialized: false,
      }
    case 'load-done':
      return {
        ...state,
        loading: false,
        initialized: true,
        data: action.payload.data,
        error: null,
      }
    case 'load-error':
      return {
        ...state,
        loading: false,
        initialized: false,
        data: null,
        error: action.payload.error,
      }
  }
}

function appStateLoadData(dispatch: EMAppStoreDispatch) {
  console.log("EMOJI", "loading data...")
  dispatch({
    type: 'load-pending',
  })
  fetch('/data/emoticons.json')
    .then((rs) => rs.json())
    .then((data) => {
      dispatch({
        type: 'load-done',
        payload: {
          data: data,
        },
      })
    })
    .catch((error) => {
      dispatch({
        type: 'load-error',
        payload: {
          error: error,
        },
      })
    })
}

export function useEmojiStore() {
  const [state, dispatch] = useReducer(appStateReducer, null, initialAppState)
  return {
    state,

    loadState: useCallback(() => appStateLoadData(dispatch), [dispatch]),
  }
}

type EmojiCategory = {
  id: string
  name: string
  path: string
  data: any
}

export function emojisAtPathFromStore(store: EMAppStore, path: string[]): EmojiCategory {
  let data: any = store.data

  let id: string = null
  let fullPath = []

  path.forEach((key) => {
    id = key
    fullPath = [...fullPath, key]
    data = data[key]
  })

  return {
    id,
    name: keyToDisplayName(id),
    path: listToURL(fullPath),

    data,
  }
}

export function emojiCategoryContent(c: EmojiCategory) {
  if (c.data.list && c.data.url) {
    return null
  }
  return Object.keys(c.data).map((id) => ({
    id,
    name: keyToDisplayName(id),
    path: listToURL([c.path, id]),
  }))
}

function listToURL(list: string[]): string {
  return [...list].filter((v) => v.length != 0).join('/')
}

function keyToDisplayName(name: string) {
  if (!name) return
  return name
    .split('_')
    .map((wrd) => wrd[0].toUpperCase() + wrd.substr(1))
    .join(' ')
}

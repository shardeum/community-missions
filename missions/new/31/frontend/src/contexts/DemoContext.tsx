import { createContext, useState } from 'react'

interface DemoContext {
  account: string
  setAccount: React.Dispatch<React.SetStateAction<string>>
  ensResolver: string
  setEnsResolver: React.Dispatch<React.SetStateAction<string>>
  isLoading: boolean
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
  texts: Array<{ key: string; value: string }>
  addText: (key: string, value: string) => void
  removeText: (key: string) => void
}

export const DemoContext = createContext<Partial<DemoContext>>({})

export const DemoContextProvider = ({ children }) => {
  const [account, setAccount] = useState()
  const [isLoading, setIsLoading] = useState(true)
  const [texts, setTexts] = useState([])

  const addText = (key, value) => {
    setTexts([...texts, { key, value }])
  }
  const removeText = key => {
    setTexts(texts.filter(text => text.key !== key))
  }

  return (
    <DemoContext.Provider value={{ account, setAccount, isLoading, setIsLoading, texts, addText, removeText }}>
      {children}
    </DemoContext.Provider>
  )
}

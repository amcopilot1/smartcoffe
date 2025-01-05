import {create} from 'zustand'
import {addDoc, collection, deleteDoc, doc, onSnapshot, query, updateDoc} from 'firebase/firestore'
import {db} from '@/lib/firebase'

export interface Ingredient {
    id: string
    name: string
    price: number
    incomingUnit: string
    usageUnit: string
    stock: number
    usage: number
    minStock?: number
    conversionFactor: number
}

interface IngredientsState {
    items: Ingredient[]
    loading: boolean
    error: string | null
    searchQuery: string
    setSearchQuery: (query: string) => void
    addIngredient: (ingredient: Omit<Ingredient, 'id'>) => Promise<void>
    updateIngredient: (id: string, ingredient: Partial<Ingredient>) => Promise<void>
    deleteIngredient: (id: string) => Promise<void>
    subscribeToIngredients: () => () => void
}

export const useIngredientsStore = create<IngredientsState>((set, get) => ({
    items: [],
    loading: false,
    error: null,
    searchQuery: '',

    setSearchQuery: (query) => set({ searchQuery: query }),

    subscribeToIngredients: () => {
        const q = query(collection(db, 'ingredients'))

        return onSnapshot(
            q,
            (snapshot) => {
                console.log('Snapshot received:', snapshot.docs);
                set((state) => ({
                    ...state,
                    items: snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    })) as Ingredient[],
                    loading: false,
                }));
            },
            (error) => {
                console.error('Error fetching ingredients:', error);
                set((state) => ({...state, error: error.message, loading: false}));
            }
        )
    },

    addIngredient: async (ingredient) => {
        set((state) => ({ ...state, loading: true, error: null }))
        try {
            await addDoc(collection(db, 'ingredients'), ingredient)
        } catch (error) {
            set((state) => ({ ...state, error: (error as Error).message }))
        } finally {
            set((state) => ({ ...state, loading: false }))
        }
    },

    updateIngredient: async (id, ingredient) => {
        set((state) => ({ ...state, loading: true, error: null }))
        try {
            await updateDoc(doc(db, 'ingredients', id), ingredient)
        } catch (error) {
            set((state) => ({ ...state, error: (error as Error).message }))
        } finally {
            set((state) => ({ ...state, loading: false }))
        }
    },

    deleteIngredient: async (id) => {
        set((state) => ({ ...state, loading: true, error: null }))
        try {
            await deleteDoc(doc(db, 'ingredients', id))
        } catch (error) {
            set((state) => ({ ...state, error: (error as Error).message }))
        } finally {
            set((state) => ({ ...state, loading: false }))
        }
    },
}))


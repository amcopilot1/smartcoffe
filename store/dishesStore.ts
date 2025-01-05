import { create } from 'zustand'
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface Category {
    id: string
    name: string
    order: number
}

export interface SizeVariant {
    size: string
    price: string
}
export interface IngredientWithQuantity {
    id: string;
    quantity: number;
}
export interface Dish {
    id: string;
    name: string;
    price: number;
    categoryId: string;
    available: boolean;
    order: number;
    mainIngredients: IngredientWithQuantity[];
    syrups?: IngredientWithQuantity[];
    alternativeMilks?: IngredientWithQuantity[];
    sizeVariants: SizeVariant[];
}

export interface DishFormData {
    name: string;
    price: number;
    categoryId: string;
    available: boolean;
    mainIngredients: IngredientWithQuantity[];
    syrups?: IngredientWithQuantity[];
    alternativeMilks?: IngredientWithQuantity[];
    sizeVariants: SizeVariant[];
}

export interface CategoryFormData {
    name: string
}


interface DishesState {
    dishes: Dish[]
    categories: Category[]
    loading: boolean
    error: string | null
    searchQuery: string
    activeTab: number
    setSearchQuery: (query: string) => void
    setActiveTab: (tab: number) => void
    subscribeToDishes: () => () => void
    subscribeToCategories: () => () => void
    addDish: (dish: Omit<Dish, 'id'>) => Promise<void>
    updateDish: (id: string, dish: Partial<Dish>) => Promise<void>
    deleteDish: (id: string) => Promise<void>
    addCategory: (category: Omit<Category, 'id'>) => Promise<void>
    updateCategory: (id: string, category: Partial<Category>) => Promise<void>
    deleteCategory: (id: string) => Promise<void>
}

export const useDishesStore = create<DishesState>((set, get) => ({
    dishes: [],
    categories: [],
    loading: false,
    error: null,
    searchQuery: '',
    activeTab: 0,

    setSearchQuery: (query) => set({ searchQuery: query }),
    setActiveTab: (tab) => set({ activeTab: tab }),

    subscribeToDishes: () => {
        const q = query(collection(db, 'dishes'), orderBy('order'))

        const unsubscribe = onSnapshot(q, (snapshot) => {
            set((state) => ({
                ...state,
                dishes: snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Dish[],
                loading: false
            }))
        }, (error) => {
            set((state) => ({ ...state, error: error.message, loading: false }))
        })

        return unsubscribe
    },

    subscribeToCategories: () => {
        const q = query(collection(db, 'categories'), orderBy('order'))

        const unsubscribe = onSnapshot(q, (snapshot) => {
            set((state) => ({
                ...state,
                categories: snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Category[],
                loading: false
            }))
        }, (error) => {
            set((state) => ({ ...state, error: error.message, loading: false }))
        })

        return unsubscribe
    },

    addDish: async (dish) => {
        set((state) => ({ ...state, loading: true, error: null }))
        try {
            await addDoc(collection(db, 'dishes'), dish)
        } catch (error) {
            set((state) => ({ ...state, error: (error as Error).message }))
        } finally {
            set((state) => ({ ...state, loading: false }))
        }
    },

    updateDish: async (id, dish) => {
        set((state) => ({ ...state, loading: true, error: null }))
        try {
            await updateDoc(doc(db, 'dishes', id), dish)
        } catch (error) {
            set((state) => ({ ...state, error: (error as Error).message }))
        } finally {
            set((state) => ({ ...state, loading: false }))
        }
    },

    deleteDish: async (id) => {
        set((state) => ({ ...state, loading: true, error: null }))
        try {
            await deleteDoc(doc(db, 'dishes', id))
        } catch (error) {
            set((state) => ({ ...state, error: (error as Error).message }))
        } finally {
            set((state) => ({ ...state, loading: false }))
        }
    },

    addCategory: async (category) => {
        set((state) => ({ ...state, loading: true, error: null }))
        try {
            await addDoc(collection(db, 'categories'), category)
        } catch (error) {
            set((state) => ({ ...state, error: (error as Error).message }))
        } finally {
            set((state) => ({ ...state, loading: false }))
        }
    },

    updateCategory: async (id, category) => {
        set((state) => ({ ...state, loading: true, error: null }))
        try {
            await updateDoc(doc(db, 'categories', id), category)
        } catch (error) {
            set((state) => ({ ...state, error: (error as Error).message }))
        } finally {
            set((state) => ({ ...state, loading: false }))
        }
    },

    deleteCategory: async (id) => {
        set((state) => ({ ...state, loading: true, error: null }))
        try {
            await deleteDoc(doc(db, 'categories', id))
        } catch (error) {
            set((state) => ({ ...state, error: (error as Error).message }))
        } finally {
            set((state) => ({ ...state, loading: false }))
        }
    },
}))
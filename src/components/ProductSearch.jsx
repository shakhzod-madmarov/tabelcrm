import { useEffect, useState } from "react"
import { getNomenclature } from "../api/tablecrm"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function extractProductPrice(product) {
  const directCandidates = [
    product?.price,
    product?.sale_price,
    product?.retail_price,
    product?.default_price,
    product?.final_price,
    product?.amount,
    product?.cost,
    product?.sum,
  ]

  for (const value of directCandidates) {
    const numeric = Number(value)
    if (Number.isFinite(numeric) && numeric > 0) {
      return numeric
    }
  }

  if (Array.isArray(product?.prices)) {
    for (const item of product.prices) {
      const numeric = Number(
        item?.price ?? item?.value ?? item?.amount ?? item?.sum
      )
      if (Number.isFinite(numeric) && numeric > 0) {
        return numeric
      }
    }
  }

  if (Array.isArray(product?.price_types)) {
    for (const item of product.price_types) {
      const numeric = Number(
        item?.price ?? item?.value ?? item?.amount ?? item?.sum
      )
      if (Number.isFinite(numeric) && numeric > 0) {
        return numeric
      }
    }
  }

  return 0
}

export default function ProductSearch({ token, onAddProduct }) {
  const [query, setQuery] = useState("")
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!token || !query || query.trim().length < 2) {
      setProducts([])
      setError("")
      return
    }

    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true)
        setError("")

        const data = await getNomenclature(token, query)
        const result = data.result || data || []

        setProducts(Array.isArray(result) ? result : [])
      } catch (err) {
        console.error(err)
        setError("Не удалось найти товары")
        setProducts([])
      } finally {
        setLoading(false)
      }
    }, 400)
    return () => clearTimeout(timeoutId)
  }, [token, query])

  function handleAdd(product) {
    const price = extractProductPrice(product)
    onAddProduct({
      nomenclature: String(product.id || product.idx),
      nomenclature_name:
        product.name || product.title || `Товар ${product.id || product.idx}`,
      quantity: 1,
      price,
    })
  }

  return (
    <Card className="mt-6 border-stone-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">4. Товары</CardTitle>
        <CardDescription>
          Найдите товар по названию и добавьте его в корзину.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="product-search">Поиск товара</Label>
          <Input
            id="product-search"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Введите название товара"
            autoComplete="off"
          />
          {loading ? (
            <p className="text-sm text-stone-500">Поиск товаров...</p>
          ) : null}
          {error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : null}
        </div>
        <div className="space-y-3">
          {products.length === 0 && query.trim().length >= 2 && !loading ? (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-4 text-sm text-stone-500">
              Товары не найдены
            </div>
          ) : null}
          {products.map((product) => {
            const displayPrice = extractProductPrice(product)
            const id = String(product.id || product.idx)
            return (
              <div
                key={id}
                className="flex flex-col gap-3 rounded-2xl border border-stone-200 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-stone-900">
                    {product.name || product.title || `Товар ${id}`}
                  </div>
                  <div className="mt-1 text-xs text-stone-500">
                    ID: {id} · Цена: {displayPrice > 0 ? displayPrice : "не указана"}
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={() => handleAdd(product)}
                  className="sm:w-auto"
                >
                  Добавить
                </Button>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
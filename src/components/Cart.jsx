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
import { Textarea } from "@/components/ui/textarea"

export default function Cart({
  goods = [],
  onUpdateItem,
  onRemoveItem,
  comment,
  onCommentChange,
}) {
  const total = goods.reduce((sum, item) => {
    return sum + Number(item.price || 0) * Number(item.quantity || 0)
  }, 0)

  return (
    <Card className="mt-6 border-stone-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">5. Корзина</CardTitle>
        <CardDescription>
          Измените количество и цену товаров перед отправкой.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {goods.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-4 text-sm text-stone-500">
            Товары еще не добавлены
          </div>
        ) : null}
        {goods.map((item, index) => (
          <article
            key={`${item.nomenclature}-${index}`}
            className="rounded-2xl border border-stone-200 p-4"
          >
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h3 className="truncate text-base font-medium text-stone-900">
                  {item.nomenclature_name}
                </h3>
                <p className="mt-1 text-xs text-stone-500">
                  ID: {item.nomenclature}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => onRemoveItem(index)}
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 sm:w-auto"
              >
                Удалить
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`quantity-${index}`}>Количество</Label>
                <Input
                  id={`quantity-${index}`}
                  type="number"
                  min="1"
                  step="1"
                  inputMode="numeric"
                  value={item.quantity ?? ""}
                  onChange={(event) =>
                    onUpdateItem(index, "quantity", event.target.value)
                  }
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`price-${index}`}>Цена</Label>
                <Input
                  id={`price-${index}`}
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={item.price ?? ""}
                  onChange={(event) =>
                    onUpdateItem(index, "price", event.target.value)
                  }
                  className="h-11"
                />
              </div>
            </div>
          </article>
        ))}
        <div className="space-y-2">
          <Label htmlFor="comment">Комментарий</Label>
          <Textarea
            id="comment"
            value={comment}
            onChange={(event) => onCommentChange(event.target.value)}
            placeholder="Комментарий к заказу"
            rows={4}
          />
        </div>
        <section className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
          <p className="text-sm text-stone-500">Итого</p>
          <p className="mt-1 text-2xl font-semibold text-stone-900">{total}</p>
        </section>
      </CardContent>
    </Card>
  )
}
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

export default function Form({
  token = "",
  onTokenChange,
  onConnect,
  loading = false,
  error = "",
}) {
  function handleSubmit(event) {
    event.preventDefault()
    onConnect()
  }
  const isDisabled = loading || !token.trim()
  return (
    <Card className="border-stone-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">1. Подключение кассы</CardTitle>
        <CardDescription>
          Введите token кассы, чтобы загрузить справочники и начать оформление
          заказа.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cashbox-token">Token</Label>
            <Input
              id="cashbox-token"
              name="token"
              type="text"
              value={token}
              onChange={(event) => onTokenChange(event.target.value)}
              placeholder="Введите token кассы"
              autoComplete="off"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "token-error" : undefined}
            />
            {error ? (
              <p id="token-error" className="text-sm text-red-600">
                {error}
              </p>
            ) : null}
          </div>
          <Button type="submit" className="w-full" disabled={isDisabled}>
            {loading ? "Подключение..." : "Подключить"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
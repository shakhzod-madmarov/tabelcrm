import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getContragents } from "../api/tablecrm"

function getClientValue(client) {
  return String(client?.id ?? client?.idx ?? "")
}

function getClientLabel(client) {
  return (
    client?.name ||
    client?.contragent_name ||
    client?.phone ||
    `Клиент ${getClientValue(client)}`
  )
}

export default function ClientSearch({
  token,
  phone,
  selectedClientId,
  onPhoneChange,
  onClientSelect,
}) {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    if (!token || !phone || phone.trim().length < 5) {
      setClients([])
      setError("")
      setHasSearched(false)
      return
    }

    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true)
        setError("")
        setHasSearched(true)

        const data = await getContragents(token, phone)
        const result = data?.result || data || []

        setClients(Array.isArray(result) ? result : [])
      } catch (err) {
        console.error(err)
        setError("Не удалось найти клиента")
        setClients([])
      } finally {
        setLoading(false)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [token, phone])

  return (
    <Card className="mt-6 border-stone-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">3. Клиент</CardTitle>
        <CardDescription>
          Введите номер телефона и выберите найденного клиента.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="client-phone">Телефон</Label>
            <Input
              id="client-phone"
              name="clientPhone"
              type="text"
              value={phone || ""}
              onChange={(event) => onPhoneChange(event.target.value)}
              placeholder="+79990000000"
              autoComplete="off"
            />
            {loading ? (
              <p className="text-sm text-stone-500">Поиск клиента...</p>
            ) : null}
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            {!loading && !error && hasSearched && clients.length === 0 ? (
              <p className="text-sm text-stone-500">Клиенты не найдены</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="client-select">Найденный клиент</Label>
            <Select
              value={selectedClientId || ""}
              onValueChange={(value) => onClientSelect(String(value))}
            >
              <SelectTrigger id="client-select" className="w-full">
                <SelectValue placeholder="Выберите клиента" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => {
                  const value = getClientValue(client)
                  if (!value) return null
                  return (
                    <SelectItem key={value} value={value}>
                      {getClientLabel(client)}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
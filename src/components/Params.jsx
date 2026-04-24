import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function getOptionValue(item) {
  return String(item?.id ?? item?.idx ?? "")
}

function getOptionLabel(item, fallback) {
  return (
    item?.name ||
    item?.title ||
    item?.number ||
    item?.label ||
    `${fallback} ${item?.id ?? item?.idx ?? ""}`
  )
}

export default function Params({
  form,
  onChange,
  organizations = [],
  payboxes = [],
  warehouses = [],
  priceTypes = [],
}) {
  return (
    <Card className="mt-6 border-stone-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">2. Параметры продажи</CardTitle>
        <CardDescription>
          Выберите организацию, счет, склад и тип цены.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="organization-select">Организация</Label>
            <Select
              value={form.organization || ""}
              onValueChange={(value) => onChange("organization", String(value))}
            >
              <SelectTrigger id="organization-select" className="w-full">
                <SelectValue placeholder="Выберите организацию" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((item) => {
                  const value = getOptionValue(item)
                  if (!value) return null
                  return (
                    <SelectItem key={value} value={value}>
                      {getOptionLabel(item, "Организация")}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="paybox-select">Счет</Label>
            <Select
              value={form.paybox || ""}
              onValueChange={(value) => onChange("paybox", String(value))}
            >
              <SelectTrigger id="paybox-select" className="w-full">
                <SelectValue placeholder="Выберите счет" />
              </SelectTrigger>
              <SelectContent>
                {payboxes.map((item) => {
                  const value = getOptionValue(item)
                  if (!value) return null
                  return (
                    <SelectItem key={value} value={value}>
                      {getOptionLabel(item, "Счет")}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="warehouse-select">Склад</Label>
            <Select
              value={form.warehouse || ""}
              onValueChange={(value) => onChange("warehouse", String(value))}
            >
              <SelectTrigger id="warehouse-select" className="w-full">
                <SelectValue placeholder="Выберите склад" />
              </SelectTrigger>
              <SelectContent>
                {warehouses.map((item) => {
                  const value = getOptionValue(item)
                  if (!value) return null
                  return (
                    <SelectItem key={value} value={value}>
                      {getOptionLabel(item, "Склад")}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="price-type-select">Тип цены</Label>
            <Select
              value={form.priceType || ""}
              onValueChange={(value) => onChange("priceType", String(value))}
            >
              <SelectTrigger id="price-type-select" className="w-full">
                <SelectValue placeholder="Выберите тип цены" />
              </SelectTrigger>
              <SelectContent>
                {priceTypes.map((item) => {
                  const value = getOptionValue(item)
                  if (!value) return null
                  return (
                    <SelectItem key={value} value={value}>
                      {getOptionLabel(item, "Тип цены")}
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
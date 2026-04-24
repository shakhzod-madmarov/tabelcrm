import { useState } from "react"
import Layout from "../components/Layout"
import Form from "../components/Form"
import Params from "../components/Params"
import ClientSearch from "../components/ClientSearch"
import ProductSearch from "../components/ProductSearch"
import Cart from "../components/Cart"
import SubmitActions from "../components/SubmitActions"
import {
  getOrganizations,
  getPayboxes,
  getWarehouses,
  getPriceTypes,
  createDocSale,
} from "../api/tablecrm"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const DEFAULT_TASK_TOKEN =
  "af1874616430e04cfd4bce30035789907e899fc7c3a1a4bb27254828ff304a77"

function normalizePhone(value) {
  return value.replace(/[^\d+]/g, "")
}

export default function Order() {
  const [token, setToken] = useState(() => {
    return localStorage.getItem("tablecrm_token") || DEFAULT_TASK_TOKEN
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isConnected, setIsConnected] = useState(false)

  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [submitSuccess, setSubmitSuccess] = useState("")
  const [submitResult, setSubmitResult] = useState(null)

  const [meta, setMeta] = useState({
    organizations: [],
    payboxes: [],
    warehouses: [],
    priceTypes: [],
  })

  const [formData, setFormData] = useState({
    organization: "",
    paybox: "",
    warehouse: "",
    priceType: "",
    clientPhone: "",
    contragent: "",
    goods: [],
    comment: "",
  })

  function resetSubmitState() {
    setSubmitError("")
    setSubmitSuccess("")
    setSubmitResult(null)
  }

  function handleTokenChange(value) {
    setToken(value)

    if (error) {
      setError("")
    }

    resetSubmitState()
  }

  function handleFormFieldChange(field, value) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    resetSubmitState()
  }

  function handlePhoneChange(value) {
    handleFormFieldChange("clientPhone", normalizePhone(value))
  }

  function handleAddProduct(product) {
    setFormData((prev) => {
      const existingIndex = prev.goods.findIndex(
        (item) => item.nomenclature === product.nomenclature
      )

      if (existingIndex !== -1) {
        const updatedGoods = [...prev.goods]
        const currentItem = updatedGoods[existingIndex]

        updatedGoods[existingIndex] = {
          ...currentItem,
          quantity: String(Number(currentItem.quantity || 0) + 1),
        }

        return {
          ...prev,
          goods: updatedGoods,
        }
      }

      return {
        ...prev,
        goods: [
          ...prev.goods,
          {
            ...product,
            quantity:
              product.quantity === "" ? "" : String(product.quantity ?? 1),
            price: product.price === "" ? "" : String(product.price ?? ""),
          },
        ],
      }
    })

    resetSubmitState()
  }

  function handleUpdateCartItem(index, field, value) {
    setFormData((prev) => {
      const updatedGoods = [...prev.goods]

      updatedGoods[index] = {
        ...updatedGoods[index],
        [field]: value === "" ? "" : value,
      }

      return {
        ...prev,
        goods: updatedGoods,
      }
    })

    resetSubmitState()
  }

  function handleRemoveCartItem(index) {
    setFormData((prev) => ({
      ...prev,
      goods: prev.goods.filter((_, itemIndex) => itemIndex !== index),
    }))

    resetSubmitState()
  }

  async function handleConnect() {
    if (!token.trim()) {
      setError("Введите token кассы")
      setIsConnected(false)
      return
    }

    try {
      setLoading(true)
      setError("")
      resetSubmitState()

      const [organizationsData, payboxesData, warehousesData, priceTypesData] =
        await Promise.all([
          getOrganizations(token),
          getPayboxes(token),
          getWarehouses(token),
          getPriceTypes(token),
        ])

      setMeta({
        organizations: organizationsData.result || organizationsData || [],
        payboxes: payboxesData.result || payboxesData || [],
        warehouses: warehousesData.result || warehousesData || [],
        priceTypes: priceTypesData.result || priceTypesData || [],
      })

      localStorage.setItem("tablecrm_token", token)
      setIsConnected(true)
    } catch (err) {
      console.error(err)

      if (err.response?.status === 403) {
        setError("Неверный или недоступный token кассы")
      } else if (err.response?.status === 422) {
        setError("Ошибка формата запроса")
      } else if (err.request) {
        setError("Сервер не ответил. Проверьте сеть или доступ к API")
      } else {
        setError("Не удалось подключить token или загрузить справочники")
      }

      setIsConnected(false)
    } finally {
      setLoading(false)
    }
  }

  function validateBeforeSubmit() {
    if (!formData.organization) return "Выберите организацию"
    if (!formData.paybox) return "Выберите счет"
    if (!formData.warehouse) return "Выберите склад"
    if (!formData.priceType) return "Выберите тип цены"
    if (!formData.goods.length) return "Добавьте хотя бы один товар"

    const hasInvalidQuantity = formData.goods.some(
      (item) => Number(item.quantity) <= 0
    )
    if (hasInvalidQuantity) {
      return "Количество товара должно быть больше 0"
    }

    const hasInvalidPrice = formData.goods.some(
      (item) => Number(item.price) <= 0
    )
    if (hasInvalidPrice) {
      return "Цена каждого товара должна быть больше 0"
    }

    return ""
  }

 function buildPayload(shouldConduct = false) {
  const payload = {
    organization: Number(formData.organization),
    paybox: Number(formData.paybox),
    warehouse: Number(formData.warehouse),
    price_type: Number(formData.priceType),
    comment: formData.comment || "",
    status: shouldConduct,
    goods: formData.goods.map((item) => ({
      nomenclature: String(item.nomenclature),
      quantity: Number(item.quantity),
      price: Number(item.price),
      price_type: Number(formData.priceType),
    })),
  }

  if (formData.contragent) {
    payload.contragent = Number(formData.contragent)
  }

  return payload
}

  async function handleSubmit(shouldConduct = false) {
    const validationError = validateBeforeSubmit()

    if (validationError) {
      setSubmitError(validationError)
      setSubmitSuccess("")
      setSubmitResult(null)
      return
    }

    try {
      setSubmitLoading(true)
      setSubmitError("")
      setSubmitSuccess("")
      setSubmitResult(null)

      const payload = buildPayload(shouldConduct)
      const result = await createDocSale(token, [payload])
      const createdDoc = Array.isArray(result) ? result[0] : result

      setSubmitResult(createdDoc || null)

      const numberText = createdDoc?.number ? ` №${createdDoc.number}` : ""

      if (shouldConduct) {
        setSubmitSuccess(`Документ${numberText} успешно создан и проведен`)
      } else {
        setSubmitSuccess(`Документ${numberText} успешно создан`)
      }
    } catch (err) {
      console.error(err)

      const backendDetail =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.response?.data?.error

      if (err.response?.status === 422) {
        setSubmitError(
          typeof backendDetail === "string"
            ? backendDetail
            : JSON.stringify(
                backendDetail || "Сервер отклонил payload",
                null,
                2
              )
        )
      } else if (err.response?.status === 403) {
        setSubmitError("Недостаточно прав для создания документа")
      } else if (err.request) {
        setSubmitError("Сервер не ответил при создании документа")
      } else {
        setSubmitError("Не удалось создать документ")
      }

      setSubmitResult(null)
    } finally {
      setSubmitLoading(false)
    }
  }

  return (
    <Layout>
      <header className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
          Мобильный заказ
        </h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          Форма для создания продажи и проведения заказа в один клик.
        </p>
      </header>
      <section
        aria-labelledby="order-form-title"
        className="mt-6 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="mb-4">
          <h2
            id="order-form-title"
            className="text-xl font-semibold text-stone-900"
          >
            Оформление заказа
          </h2>

          <p className="mt-2 text-sm text-stone-600">
            Заполните token, клиента, параметры продажи, добавьте товары и
            отправьте документ.
          </p>
        </div>
        <Form
          token={token}
          onTokenChange={handleTokenChange}
          onConnect={handleConnect}
          loading={loading}
          error={error}
        />
        {isConnected ? (
          <>
            <Card className="mt-4 border-emerald-200 bg-emerald-50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-emerald-900">
                  Справочники успешно загружены
                </CardTitle>
                <CardDescription className="text-emerald-700">
                  Token подключен. Можно продолжать оформление заказа.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm text-emerald-800 sm:grid-cols-4">
                <div className="rounded-xl bg-white/60 p-3">
                  <div className="text-xs text-emerald-700">Организации</div>
                  <div className="mt-1 text-lg font-semibold">
                    {meta.organizations.length}
                  </div>
                </div>
                <div className="rounded-xl bg-white/60 p-3">
                  <div className="text-xs text-emerald-700">Счета</div>
                  <div className="mt-1 text-lg font-semibold">
                    {meta.payboxes.length}
                  </div>
                </div>
                <div className="rounded-xl bg-white/60 p-3">
                  <div className="text-xs text-emerald-700">Склады</div>
                  <div className="mt-1 text-lg font-semibold">
                    {meta.warehouses.length}
                  </div>
                </div>
                <div className="rounded-xl bg-white/60 p-3">
                  <div className="text-xs text-emerald-700">Типы цен</div>
                  <div className="mt-1 text-lg font-semibold">
                    {meta.priceTypes.length}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Params
              form={formData}
              onChange={handleFormFieldChange}
              organizations={meta.organizations}
              payboxes={meta.payboxes}
              warehouses={meta.warehouses}
              priceTypes={meta.priceTypes}
            />
            <ClientSearch
              token={token}
              phone={formData.clientPhone}
              selectedClientId={formData.contragent}
              onPhoneChange={handlePhoneChange}
              onClientSelect={(value) =>
                handleFormFieldChange("contragent", value)
              }
            />
            <ProductSearch token={token} onAddProduct={handleAddProduct} />
            <Cart
              goods={formData.goods}
              comment={formData.comment}
              onCommentChange={(value) =>
                handleFormFieldChange("comment", value)
              }
              onUpdateItem={handleUpdateCartItem}
              onRemoveItem={handleRemoveCartItem}
            />
            <SubmitActions
              loading={submitLoading}
              error={submitError}
              success={submitSuccess}
              onCreate={() => handleSubmit(false)}
              onCreateAndConduct={() => handleSubmit(true)}
            />
            {submitResult ? (
              <Card className="mt-4 border-stone-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">
                    Результат создания документа
                  </CardTitle>
                  <CardDescription>
                    Документ успешно создан в TableCRM.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-3 text-sm text-stone-700 sm:grid-cols-2">
                  <div className="rounded-xl bg-stone-50 p-3">
                    <div className="text-xs text-stone-500">ID</div>
                    <div className="mt-1 font-medium">
                      {submitResult.id ?? "—"}
                    </div>
                  </div>
                  <div className="rounded-xl bg-stone-50 p-3">
                    <div className="text-xs text-stone-500">Номер</div>
                    <div className="mt-1 font-medium">
                      {submitResult.number ?? "—"}
                    </div>
                  </div>
                  <div className="rounded-xl bg-stone-50 p-3">
                    <div className="text-xs text-stone-500">Операция</div>
                    <div className="mt-1 font-medium">
                      {submitResult.operation ?? "—"}
                    </div>
                  </div>
                  <div className="rounded-xl bg-stone-50 p-3">
                    <div className="text-xs text-stone-500">Статус заказа</div>
                    <div className="mt-1 font-medium">
                      {submitResult.order_status ?? "—"}
                    </div>
                  </div>
                  <div className="rounded-xl bg-stone-50 p-3">
                    <div className="text-xs text-stone-500">Сумма</div>
                    <div className="mt-1 font-medium">
                      {submitResult.sum ?? "—"}
                    </div>
                  </div>
                  <div className="rounded-xl bg-stone-50 p-3">
                    <div className="text-xs text-stone-500">Организация</div>
                    <div className="mt-1 font-medium">
                      {submitResult.organization ?? "—"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </>
        ) : null}
      </section>
    </Layout>
  )
}
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function SubmitActions({
  loading = false,
  error = "",
  success = "",
  onCreate,
  onCreateAndConduct,
}) {
  return (
    <Card className="mt-6 border-stone-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">6. Отправка</CardTitle>
        <CardDescription>
          Создайте продажу или сразу создайте и проведите документ.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCreate}
            disabled={loading}
          >
            {loading ? "Отправка..." : "Создать продажу"}
          </Button>
          <Button
            type="button"
            onClick={onCreateAndConduct}
            disabled={loading}
          >
            {loading ? "Отправка..." : "Создать и провести"}
          </Button>
        </div>
        {error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 whitespace-pre-wrap break-words">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            {success}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
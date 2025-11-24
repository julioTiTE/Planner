/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { Calendar as CalendarUI } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Trash2 } from "lucide-react"

type Event = {
  id: string
  date: Date
  title: string
  description: string
  color: string
}

export function Calendar() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [events, setEvents] = useState<Event[]>([])
  const [newEvent, setNewEvent] = useState<Omit<Event, "id">>({
    date: new Date(),
    title: "",
    description: "",
    color: "#FF5A5F",
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDateEvents, setSelectedDateEvents] = useState<Event[]>([])

  type RawEvent = Omit<Event, "date"> & { date: string }

  useEffect(() => {
    const savedEvents = localStorage.getItem("calendar-events")
    if (savedEvents) {
      try {
        const parsedEvents = JSON.parse(savedEvents).map((event: RawEvent) => ({
          ...event,
          date: new Date(event.date),
        }))
        setEvents(parsedEvents)
      } catch (error) {
        console.error("Error parsing saved events:", error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("calendar-events", JSON.stringify(events))
  }, [events])

  useEffect(() => {
    if (date) {
      const dateEvents = events.filter((event) => event.date.toDateString() === date.toDateString())
      setSelectedDateEvents(dateEvents)
    }
  }, [date, events])

  const handleAddEvent = () => {
    if (!newEvent.title.trim()) return

    const event: Event = {
      id: Date.now().toString(),
      ...newEvent,
    }

    setEvents([...events, event])
    setNewEvent({
      date: date || new Date(),
      title: "",
      description: "",
      color: "#FF5A5F",
    })
    setIsDialogOpen(false)
  }

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter((event) => event.id !== id))
  }

  const getDayClass = (day: Date) => {
    const hasEvent = events.some((event) => event.date.toDateString() === day.toDateString())
    return hasEvent ? "bg-pink-100 dark:bg-pink-900 rounded-full" : ""
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 bg-pink-50 dark:bg-gray-900 p-4 rounded-lg border border-pink-100 dark:border-pink-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-pink-600 dark:text-pink-300">Calendário</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1 bg-white dark:bg-gray-800">
                <PlusCircle className="h-4 w-4" />
                <span>Evento</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Evento</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Título do evento"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Descrição do evento"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="color">Cor</Label>
                  <div className="flex gap-2">
                    {["#FF5A5F", "#00A699", "#FC642D", "#8A4F7D", "#FF9E80"].map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full ${newEvent.color === color ? "ring-2 ring-offset-2 ring-black dark:ring-white" : ""}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewEvent({ ...newEvent, color })}
                      />
                    ))}
                  </div>
                </div>
                <Button onClick={handleAddEvent}>Adicionar Evento</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <CalendarUI
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
          modifiers={{
            highlighted: events.map((event) => event.date),
          }}
          modifiersClassNames={{
            highlighted: "bg-pink-100 dark:bg-pink-400 rounded-full",
          }}
          components={{
            DayContent: (props) => <div className={`${getDayClass(props.date)}`}>{props.date.getDate()}</div>,
          }}
        />

        <div className="mt-4 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-pink-400"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Eventos</span>
          </div>
        </div>
      </div>

      <div className="md:col-span-2">
        <Card>
          <CardHeader className="bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900">
            <CardTitle className="flex items-center justify-between">
              <span>
                {date
                  ? date.toLocaleDateString("pt-BR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Selecione uma data"}
              </span>
              <span className="text-sm bg-white dark:bg-gray-800 px-2 py-1 rounded-full">
                {selectedDateEvents.length} evento(s)
              </span>
            </CardTitle>
            <CardDescription>Gerencie seus eventos para esta data</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {selectedDateEvents.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-500 dark:border-gray-700 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">Nenhum evento para esta data</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setNewEvent({ ...newEvent, date: date || new Date() })
                    setIsDialogOpen(true)
                  }}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Adicionar Evento
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                  {selectedDateEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 relative"
                      style={{ borderLeftColor: event.color, borderLeftWidth: "4px" }}
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-lg">{event.title}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEvent(event.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                        </Button>
                      </div>
                      {event.description && (
                        <p className="mt-2 text-gray-600 dark:text-gray-400">{event.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

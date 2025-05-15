"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Calendar as CalendarUI } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Trash2, Edit, Check, X, Moon, Sun } from "lucide-react"

// Tipos
type Event = {
  id: string
  date: Date
  title: string
  description: string
  color: string
}

type SerializedEvent = {
  id: string
  date: string  // Data serializada como string
  title: string
  description: string
  color: string
}

type Task = {
  id: string
  title: string
  description: string
  category: string
  priority: "baixa" | "média" | "alta"
  completed: boolean
}

// Constantes
const CATEGORIES = ["Trabalho", "Pessoal", "Saúde", "Finanças", "Casa", "Estudos", "Lazer"]

const PRIORITIES = [
  { value: "baixa", label: "Baixa", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
  { value: "média", label: "Média", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
  { value: "alta", label: "Alta", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
]

// Funções auxiliares para serialização e desserialização
function serializeEvents(events: Event[]): SerializedEvent[] {
  return events.map(event => ({
    ...event,
    date: event.date.toISOString() // Convertendo Date para string ISO
  }));
}

function deserializeEvents(serializedEvents: SerializedEvent[]): Event[] {
  return serializedEvents.map(event => ({
    ...event,
    date: new Date(event.date) // Convertendo string ISO de volta para Date
  }));
}

// Componente ThemeToggle
function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="rounded-full"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Alternar tema</span>
    </Button>
  )
}

// Componente Calendar
function Calendar() {
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
  const [isLoaded, setIsLoaded] = useState(false)

  // Load events from localStorage on component mount
  useEffect(() => {
    try {
      const savedEvents = localStorage.getItem("calendar-events")
      if (savedEvents) {
        const parsedEvents = JSON.parse(savedEvents)
        // Garantir que as datas sejam convertidas corretamente
        const eventsWithDates = deserializeEvents(parsedEvents)
        setEvents(eventsWithDates)
      }
    } catch (error) {
      console.error("Error loading saved events:", error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save events to localStorage whenever they change
  useEffect(() => {
    if (isLoaded && events.length >= 0) {
      try {
        // Serializar as datas antes de salvar no localStorage
        const serializedEvents = serializeEvents(events)
        localStorage.setItem("calendar-events", JSON.stringify(serializedEvents))
      } catch (error) {
        console.error("Error saving events:", error)
      }
    }
  }, [events, isLoaded])

  // Update selected date events whenever date or events change
  useEffect(() => {
    if (date) {
      const dateEvents = events.filter((event) => {
        const eventDate = new Date(event.date)
        return eventDate.toDateString() === date.toDateString()
      })
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
      color: "#3B82F6", 
    })
    setIsDialogOpen(false)
  }

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter((event) => event.id !== id))
  }

  // Function to highlight dates with events
  const getDayClass = (day: Date) => {
    const hasEvent = events.some((event) => {
      const eventDate = new Date(event.date)
      return eventDate.toDateString() === day.toDateString()
    })
    return hasEvent ? "bg-blue-100 dark:bg-blue-900 rounded-full" : "";
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 bg-blue-50 dark:bg-gray-900 p-4 rounded-lg border border-blue-800 dark:border-blue-800">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-semibold text-blue-500 dark:text-blue-300">Calendário</h2>
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
                        className={`w-8 h-8 rounded-full ${
                          newEvent.color === color ? "ring-2 ring-offset-2 ring-black dark:ring-white" : ""
                        }`}
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
        customStyles: events.map((event) => new Date(event.date)),
          }}

          modifiersClassNames={{
            customStyles: "bg-blue-100 dark:bg-blue-900 rounded-full",
          }}
          components={{
            DayContent: (props) => <div className={`${getDayClass(props.date)}`}>{props.date.getDate()}</div>,
          }}
        />
        <div className="mt-4 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Eventos</span>
          </div>
        </div>
      </div>

      <div className="md:col-span-2">
        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-300 dark:from-blue-800 dark:to-blue-900">
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
              <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
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

// Componente Planner
function Planner() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState<Omit<Task, "id" | "completed">>({
    title: "",
    description: "",
    category: "Pessoal",
    priority: "média",
  })
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [isLoaded, setIsLoaded] = useState(false)

  // Load tasks from localStorage on component mount
  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem("planner-tasks")
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks))
      }
    } catch (error) {
      console.error("Error loading saved tasks:", error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (isLoaded && tasks.length >= 0) {
      try {
        localStorage.setItem("planner-tasks", JSON.stringify(tasks))
      } catch (error) {
        console.error("Error saving tasks:", error)
      }
    }
  }, [tasks, isLoaded])

  const handleAddTask = () => {
    if (!newTask.title.trim()) return

    const task: Task = {
      id: Date.now().toString(),
      ...newTask,
      completed: false,
    }

    setTasks([...tasks, task])
    setNewTask({
      title: "",
      description: "",
      category: "Pessoal",
      priority: "média",
    })
  }

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const handleToggleComplete = (id: string) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const handleEditTask = () => {
    if (!editingTask || !editingTask.title.trim()) return

    setTasks(tasks.map((task) => (task.id === editingTask.id ? editingTask : task)))

    setEditingTask(null)
  }

  const filteredTasks =
    activeCategory === "all"
      ? tasks
      : activeCategory === "completed"
        ? tasks.filter((task) => task.completed)
        : activeCategory === "pending"
          ? tasks.filter((task) => !task.completed)
          : tasks.filter((task) => task.category === activeCategory)

  const getPriorityBadge = (priority: string) => {
    const priorityInfo = PRIORITIES.find((p) => p.value === priority)
    return priorityInfo ? priorityInfo.color : ""
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card className="bg-gradient-to-b from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900">
            <CardHeader>
              <CardTitle className="text-xl text-blue-500 dark:text-blue-300">Adicionar Tarefa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Título da tarefa"
                    className="border border-blue-400 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Descrição da tarefa"
                    className="border border-blue-400 focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={newTask.category}
                    onValueChange={(value) => setNewTask({ ...newTask, category: value })}
                  >
                    <SelectTrigger className="border border-blue-400 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value: "baixa" | "média" | "alta") => setNewTask({ ...newTask, priority: value })}
                  >
                    <SelectTrigger className="border border-blue-400 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleAddTask} className="w-full bg-blue-400 hover:bg-blue-500 text-white">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Adicionar Tarefa
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-300 dark:from-blue-800 dark:to-blue-900">
              <CardTitle className="flex items-center justify-between">
                <span>Minhas Tarefas</span>
                <Badge variant="outline" className="bg-white dark:bg-gray-800">
                  {tasks.filter((t) => !t.completed).length} pendentes
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="all" className="w-full" onValueChange={setActiveCategory}>
                <TabsList className="w-full justify-start rounded-none px-6 pt-2 bg-gray-50 dark:bg-gray-900 border-b">
                  <TabsTrigger
                    value="all"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
                  >
                    Todas
                  </TabsTrigger>
                  <TabsTrigger
                    value="pending"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
                  >
                    Pendentes
                  </TabsTrigger>
                  <TabsTrigger
                    value="completed"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
                  >
                    Concluídas
                  </TabsTrigger>
                  {CATEGORIES.map((category) => (
                    <TabsTrigger
                      key={category}
                      value={category}
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 hidden md:flex"
                    >
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value={activeCategory} className="mt-0">
                  <ScrollArea className="h-[400px]">
                    <div className="p-6 space-y-4">
                      {filteredTasks.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                          <p className="text-gray-500 dark:text-gray-400">Nenhuma tarefa encontrada</p>
                        </div>
                      ) : (
                        filteredTasks.map((task) => (
                          <div
                            key={task.id}
                            className={`p-4 rounded-lg border border-gray-200 dark:border-gray-700 ${
                              task.completed ? "bg-gray-50 dark:bg-gray-900" : ""
                            }`}
                          >
                            {editingTask && editingTask.id === task.id ? (
                              <div className="space-y-3">
                                <Input
                                  value={editingTask.title}
                                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                                  className="font-medium"
                                />
                                <Textarea
                                  value={editingTask.description}
                                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                                  rows={2}
                                />
                                <div className="grid grid-cols-2 gap-2">
                                  <Select
                                    value={editingTask.category}
                                    onValueChange={(value) => setEditingTask({ ...editingTask, category: value })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {CATEGORIES.map((category) => (
                                        <SelectItem key={category} value={category}>
                                          {category}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <Select
                                    value={editingTask.priority}
                                    onValueChange={(value: "baixa" | "média" | "alta") =>
                                      setEditingTask({ ...editingTask, priority: value })
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {PRIORITIES.map((priority) => (
                                        <SelectItem key={priority.value} value={priority.value}>
                                          {priority.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button size="sm" variant="ghost" onClick={() => setEditingTask(null)}>
                                    <X className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" onClick={handleEditTask}>
                                    <Check className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start gap-3">
                                    <Checkbox
                                      checked={task.completed}
                                      onCheckedChange={() => handleToggleComplete(task.id)}
                                      className="mt-1"
                                    />
                                    <div>
                                      <h3
                                        className={`font-medium text-lg ${
                                          task.completed ? "line-through text-gray-500 dark:text-gray-400" : ""
                                        }`}
                                      >
                                        {task.title}
                                      </h3>
                                      {task.description && (
                                        <p
                                          className={`mt-1 text-gray-600 dark:text-gray-400 ${
                                            task.completed ? "line-through" : ""
                                          }`}
                                        >
                                          {task.description}
                                        </p>
                                      )}
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        <Badge variant="secondary">{task.category}</Badge>
                                        <Badge className={getPriorityBadge(task.priority)}>
                                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setEditingTask(task)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Edit className="h-4 w-4 text-gray-500 hover:text-blue-500" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteTask(task.id)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                                    </Button>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Componente principal da página
export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-400 dark:text-blue-300 flex items-center gap-2">
            <span className="hidden sm:inline">🧿</span> Planner Digital{" "}
            <span className="hidden sm:inline">🧿</span>
          </h1>
          <ThemeToggle />
        </div>

        <div className="relative mb-8 overflow-hidden rounded-lg">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-blue-200 dark:border-blue-500 relative z-10">
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Organize suas tarefas, eventos e compromissos em
              um só lugar com um visual alegre e colorido.
            </p>
          </div>
        </div>

        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="calendar" className="text-lg py-3">
              <span className="mr-2">📅</span> Calendário
            </TabsTrigger>
            <TabsTrigger value="planner" className="text-lg py-3">
              <span className="mr-2">📝</span> Planner
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="mt-0">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-blue-200 dark:border-blue-500">
              <Calendar />
            </div>
          </TabsContent>

          <TabsContent value="planner" className="mt-0">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-blue-200 dark:border-blue-500">
              <Planner />
            </div>
          </TabsContent>
        </Tabs>

        <footer className="mt-12 text-center text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Planner Digital - Todos os direitos reservados</p>
        </footer>
      </div>
    </main>
  )}

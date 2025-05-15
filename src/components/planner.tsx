"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PlusCircle, Trash2, Edit, Check, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Task = {
  id: string
  title: string
  description: string
  category: string
  priority: "baixa" | "média" | "alta"
  completed: boolean
}

const CATEGORIES = ["Trabalho", "Pessoal", "Saúde", "Finanças", "Casa", "Estudos", "Lazer"]

const PRIORITIES = [
  { value: "baixa", label: "Baixa", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
  { value: "média", label: "Média", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
  { value: "alta", label: "Alta", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
]

export function Planner() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState<Omit<Task, "id" | "completed">>({
    title: "",
    description: "",
    category: "Pessoal",
    priority: "média",
  })
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("all")

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("planner-tasks")
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks))
      } catch (error) {
        console.error("Error parsing saved tasks:", error)
      }
    }
  }, [])

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("planner-tasks", JSON.stringify(tasks))
  }, [tasks])

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
          <Card className="bg-gradient-to-b from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
            <CardHeader>
              <CardTitle className="text-xl text-pink-600 dark:text-pink-300">Adicionar Tarefa</CardTitle>
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
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Descrição da tarefa"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={newTask.category}
                    onValueChange={(value) => setNewTask({ ...newTask, category: value })}
                  >
                    <SelectTrigger>
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
                    <SelectTrigger>
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

                <Button onClick={handleAddTask} className="w-full bg-pink-500 hover:bg-pink-600 text-white">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Adicionar Tarefa
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader className="bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900">
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

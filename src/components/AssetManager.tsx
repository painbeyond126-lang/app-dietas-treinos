'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { assets, UserAsset } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, DollarSign, Package, Edit, AlertCircle, LogOut } from 'lucide-react'

export function AssetManager() {
  const { user, profile, signOut } = useAuth()
  const [userAssets, setUserAssets] = useState<UserAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    value: '',
    category: '',
  })

  const categories = [
    'Imóveis',
    'Veículos',
    'Investimentos',
    'Eletrônicos',
    'Móveis',
    'Joias',
    'Arte',
    'Outros'
  ]

  useEffect(() => {
    if (user) {
      loadAssets()
    }
  }, [user])

  const loadAssets = async () => {
    if (!user) return
    
    setLoading(true)
    const { data, error } = await assets.getAll(user.id)
    
    if (error) {
      setMessage({ type: 'error', text: 'Erro ao carregar ativos' })
    } else {
      setUserAssets(data || [])
    }
    
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setCreating(true)
    setMessage(null)

    const assetData = {
      user_id: user.id,
      name: formData.name,
      description: formData.description || null,
      value: formData.value ? parseFloat(formData.value) : null,
      category: formData.category || null,
    }

    let result
    if (editing) {
      result = await assets.update(editing, assetData)
    } else {
      result = await assets.create(assetData)
    }

    if (result.error) {
      setMessage({ type: 'error', text: 'Erro ao salvar ativo' })
    } else {
      setMessage({ 
        type: 'success', 
        text: editing ? 'Ativo atualizado com sucesso!' : 'Ativo criado com sucesso!' 
      })
      setFormData({ name: '', description: '', value: '', category: '' })
      setDialogOpen(false)
      setEditing(null)
      loadAssets()
    }

    setCreating(false)
  }

  const handleEdit = (asset: UserAsset) => {
    setFormData({
      name: asset.name,
      description: asset.description || '',
      value: asset.value?.toString() || '',
      category: asset.category || '',
    })
    setEditing(asset.id)
    setDialogOpen(true)
  }

  const handleNewAsset = () => {
    setFormData({ name: '', description: '', value: '', category: '' })
    setEditing(null)
    setDialogOpen(true)
  }

  const formatCurrency = (value: number | null) => {
    if (!value) return 'N/A'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const totalValue = userAssets.reduce((sum, asset) => sum + (asset.value || 0), 0)

  const handleSignOut = async () => {
    await signOut()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Meus Ativos
            </h1>
            <p className="text-gray-600 mt-1">
              Olá, {profile?.full_name || user?.email}! Gerencie seus ativos aqui.
            </p>
          </div>
          <Button onClick={handleSignOut} variant="outline" className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>

        {message && (
          <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Ativos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userAssets.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ações</CardTitle>
            </CardHeader>
            <CardContent>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleNewAsset} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Ativo
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editing ? 'Editar Ativo' : 'Novo Ativo'}
                    </DialogTitle>
                    <DialogDescription>
                      {editing ? 'Atualize as informações do seu ativo.' : 'Adicione um novo ativo ao seu portfólio.'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome do Ativo *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: Casa, Carro, Ações..."
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoria</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="value">Valor (R$)</Label>
                      <Input
                        id="value"
                        type="number"
                        step="0.01"
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        placeholder="0,00"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Detalhes adicionais sobre o ativo..."
                        rows={3}
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={creating}>
                      {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {editing ? 'Atualizar' : 'Criar'} Ativo
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Ativos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userAssets.map((asset) => (
            <Card key={asset.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{asset.name}</CardTitle>
                    {asset.category && (
                      <Badge variant="secondary" className="mt-1">
                        {asset.category}
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(asset)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(asset.value)}
                  </div>
                  {asset.description && (
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {asset.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">
                    Criado em {new Date(asset.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {userAssets.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum ativo cadastrado
              </h3>
              <p className="text-gray-600 mb-4">
                Comece adicionando seu primeiro ativo ao portfólio.
              </p>
              <Button onClick={handleNewAsset}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Ativo
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
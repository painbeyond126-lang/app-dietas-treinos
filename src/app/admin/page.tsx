'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { 
  Settings, 
  Palette, 
  Type, 
  Layout, 
  Save,
  Eye,
  LogOut,
  Shield,
  Flame,
  Skull
} from 'lucide-react'

export default function AdminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Estados de configuração
  const [config, setConfig] = useState({
    // Cores
    primaryColor: '#dc2626',
    secondaryColor: '#ea580c',
    backgroundColor: '#000000',
    textColor: '#ffffff',
    
    // Tipografia
    appTitle: 'BEYOND PAIN',
    appSubtitle: 'LIFEPRO FITNESS',
    impactPhrase: 'NO PAIN NO GAIN',
    
    // Layout
    logoUrl: 'https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/2b4fd262-4d12-4ac5-9d0b-204137380360.jpg',
    showImpactPhrase: true,
    headerStyle: 'gradient',
    
    // Funcionalidades
    enableCalculator: true,
    enableWorkouts: true,
    enableNutrition: true,
    enableProgress: true,
    enableAICoach: true
  })

  useEffect(() => {
    // Verificar se já está autenticado
    const adminAuth = localStorage.getItem('adminAuth')
    if (adminAuth === 'authenticated') {
      setIsAuthenticated(true)
    }
    
    // Carregar configurações salvas
    const savedConfig = localStorage.getItem('appConfig')
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig))
    }
    
    setIsLoading(false)
  }, [])

  const handleLogin = () => {
    // Senha padrão: admin123 (em produção, use autenticação real)
    if (adminPassword === 'admin123') {
      localStorage.setItem('adminAuth', 'authenticated')
      setIsAuthenticated(true)
    } else {
      alert('Senha incorreta!')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminAuth')
    setIsAuthenticated(false)
    router.push('/')
  }

  const saveConfig = () => {
    localStorage.setItem('appConfig', JSON.stringify(config))
    alert('Configurações salvas com sucesso! Recarregue a página para ver as mudanças.')
  }

  const previewChanges = () => {
    localStorage.setItem('appConfig', JSON.stringify(config))
    window.open('/', '_blank')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-red-600/50">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="h-16 w-16 text-red-500" />
            </div>
            <CardTitle className="text-white text-3xl font-black">
              PAINEL ADMINISTRATIVO
            </CardTitle>
            <CardDescription className="text-gray-400">
              Acesso restrito - Digite a senha de administrador
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-password" className="text-gray-300 font-bold">
                Senha de Administrador
              </Label>
              <Input
                id="admin-password"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="Digite a senha"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <Button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-black text-lg py-6"
            >
              <Shield className="h-5 w-5 mr-2" />
              ACESSAR PAINEL
            </Button>
            <p className="text-center text-gray-500 text-sm">
              Senha padrão: admin123
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header Admin */}
      <div className="bg-gradient-to-r from-black via-gray-900 to-black border-b-4 border-red-600 shadow-2xl shadow-red-900/50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Shield className="h-10 w-10 text-red-500" />
              <div>
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-red-600">
                  PAINEL ADMINISTRATIVO
                </h1>
                <p className="text-sm text-gray-300 font-bold">
                  Personalize seu aplicativo fitness
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={previewChanges}
                variant="outline"
                className="border-2 border-blue-600 text-blue-500 hover:bg-blue-600 hover:text-white font-bold"
              >
                <Eye className="h-4 w-4 mr-2" />
                Visualizar
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-2 border-red-600 text-red-500 hover:bg-red-600 hover:text-white font-bold"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="appearance" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-gray-900 via-black to-gray-900 border-2 border-red-600/50">
            <TabsTrigger
              value="appearance"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-600 data-[state=active]:text-white font-bold"
            >
              <Palette className="h-4 w-4 mr-2" />
              Aparência
            </TabsTrigger>
            <TabsTrigger
              value="content"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-600 data-[state=active]:text-white font-bold"
            >
              <Type className="h-4 w-4 mr-2" />
              Conteúdo
            </TabsTrigger>
            <TabsTrigger
              value="layout"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-600 data-[state=active]:text-white font-bold"
            >
              <Layout className="h-4 w-4 mr-2" />
              Layout
            </TabsTrigger>
          </TabsList>

          {/* ABA APARÊNCIA */}
          <TabsContent value="appearance" className="space-y-6">
            <Card className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-red-600/50">
              <CardHeader>
                <CardTitle className="text-white text-2xl font-black flex items-center gap-2">
                  <Palette className="h-6 w-6 text-red-500" />
                  Cores e Estilo Visual
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Personalize as cores do aplicativo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="primary-color" className="text-gray-300 font-bold">
                      Cor Primária
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="primary-color"
                        type="color"
                        value={config.primaryColor}
                        onChange={(e) => setConfig({...config, primaryColor: e.target.value})}
                        className="w-20 h-12 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={config.primaryColor}
                        onChange={(e) => setConfig({...config, primaryColor: e.target.value})}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondary-color" className="text-gray-300 font-bold">
                      Cor Secundária
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondary-color"
                        type="color"
                        value={config.secondaryColor}
                        onChange={(e) => setConfig({...config, secondaryColor: e.target.value})}
                        className="w-20 h-12 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={config.secondaryColor}
                        onChange={(e) => setConfig({...config, secondaryColor: e.target.value})}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bg-color" className="text-gray-300 font-bold">
                      Cor de Fundo
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="bg-color"
                        type="color"
                        value={config.backgroundColor}
                        onChange={(e) => setConfig({...config, backgroundColor: e.target.value})}
                        className="w-20 h-12 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={config.backgroundColor}
                        onChange={(e) => setConfig({...config, backgroundColor: e.target.value})}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="text-color" className="text-gray-300 font-bold">
                      Cor do Texto
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="text-color"
                        type="color"
                        value={config.textColor}
                        onChange={(e) => setConfig({...config, textColor: e.target.value})}
                        className="w-20 h-12 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={config.textColor}
                        onChange={(e) => setConfig({...config, textColor: e.target.value})}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Preview de Cores */}
                <div className="bg-gray-800 p-6 rounded-lg border-2 border-gray-700">
                  <p className="text-gray-300 font-bold mb-4">Preview das Cores:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div 
                        className="w-full h-20 rounded-lg mb-2"
                        style={{backgroundColor: config.primaryColor}}
                      />
                      <p className="text-gray-400 text-sm">Primária</p>
                    </div>
                    <div className="text-center">
                      <div 
                        className="w-full h-20 rounded-lg mb-2"
                        style={{backgroundColor: config.secondaryColor}}
                      />
                      <p className="text-gray-400 text-sm">Secundária</p>
                    </div>
                    <div className="text-center">
                      <div 
                        className="w-full h-20 rounded-lg mb-2 border-2 border-gray-600"
                        style={{backgroundColor: config.backgroundColor}}
                      />
                      <p className="text-gray-400 text-sm">Fundo</p>
                    </div>
                    <div className="text-center">
                      <div 
                        className="w-full h-20 rounded-lg mb-2 flex items-center justify-center"
                        style={{
                          backgroundColor: config.backgroundColor,
                          color: config.textColor,
                          border: '2px solid #4b5563'
                        }}
                      >
                        <span className="font-bold">Texto</span>
                      </div>
                      <p className="text-gray-400 text-sm">Texto</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA CONTEÚDO */}
          <TabsContent value="content" className="space-y-6">
            <Card className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-red-600/50">
              <CardHeader>
                <CardTitle className="text-white text-2xl font-black flex items-center gap-2">
                  <Type className="h-6 w-6 text-red-500" />
                  Textos e Conteúdo
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Edite os textos principais do aplicativo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="app-title" className="text-gray-300 font-bold">
                    Título do Aplicativo
                  </Label>
                  <Input
                    id="app-title"
                    type="text"
                    value={config.appTitle}
                    onChange={(e) => setConfig({...config, appTitle: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="app-subtitle" className="text-gray-300 font-bold">
                    Subtítulo do Aplicativo
                  </Label>
                  <Input
                    id="app-subtitle"
                    type="text"
                    value={config.appSubtitle}
                    onChange={(e) => setConfig({...config, appSubtitle: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="impact-phrase" className="text-gray-300 font-bold">
                    Frase de Impacto
                  </Label>
                  <Input
                    id="impact-phrase"
                    type="text"
                    value={config.impactPhrase}
                    onChange={(e) => setConfig({...config, impactPhrase: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo-url" className="text-gray-300 font-bold">
                    URL do Logo
                  </Label>
                  <Input
                    id="logo-url"
                    type="text"
                    value={config.logoUrl}
                    onChange={(e) => setConfig({...config, logoUrl: e.target.value})}
                    placeholder="https://..."
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                  {config.logoUrl && (
                    <div className="mt-4 flex justify-center">
                      <img 
                        src={config.logoUrl} 
                        alt="Logo Preview" 
                        className="h-20 w-20 rounded-full border-4 border-red-600"
                      />
                    </div>
                  )}
                </div>

                {/* Preview do Header */}
                <div className="bg-gray-800 p-6 rounded-lg border-2 border-gray-700">
                  <p className="text-gray-300 font-bold mb-4">Preview do Header:</p>
                  <div 
                    className="p-6 rounded-lg"
                    style={{
                      background: `linear-gradient(to right, ${config.backgroundColor}, #1f2937, ${config.backgroundColor})`,
                      borderBottom: `4px solid ${config.primaryColor}`
                    }}
                  >
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <img 
                          src={config.logoUrl} 
                          alt="Logo" 
                          className="h-20 w-20 rounded-full border-4"
                          style={{borderColor: config.primaryColor}}
                        />
                        <div className="absolute -top-1 -right-1">
                          <Flame className="h-8 w-8 text-orange-500 animate-bounce" />
                        </div>
                      </div>
                      <div>
                        <h1 
                          className="text-4xl font-black"
                          style={{
                            background: `linear-gradient(to right, ${config.primaryColor}, ${config.secondaryColor}, ${config.primaryColor})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                          }}
                        >
                          {config.appTitle}
                        </h1>
                        <p className="text-sm text-gray-300 font-black tracking-[0.3em] uppercase mt-1">
                          {config.appSubtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA LAYOUT */}
          <TabsContent value="layout" className="space-y-6">
            <Card className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-red-600/50">
              <CardHeader>
                <CardTitle className="text-white text-2xl font-black flex items-center gap-2">
                  <Layout className="h-6 w-6 text-red-500" />
                  Configurações de Layout
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Ative ou desative funcionalidades do aplicativo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div>
                      <p className="text-white font-bold">Calculadora Fitness</p>
                      <p className="text-gray-400 text-sm">IMC, TMB, TDEE e macros</p>
                    </div>
                    <Button
                      onClick={() => setConfig({...config, enableCalculator: !config.enableCalculator})}
                      variant={config.enableCalculator ? 'default' : 'outline'}
                      className={config.enableCalculator ? 'bg-green-600' : 'border-gray-600'}
                    >
                      {config.enableCalculator ? 'Ativado' : 'Desativado'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div>
                      <p className="text-white font-bold">Treinos Pull/Push/Leg</p>
                      <p className="text-gray-400 text-sm">Planos de treino completos</p>
                    </div>
                    <Button
                      onClick={() => setConfig({...config, enableWorkouts: !config.enableWorkouts})}
                      variant={config.enableWorkouts ? 'default' : 'outline'}
                      className={config.enableWorkouts ? 'bg-green-600' : 'border-gray-600'}
                    >
                      {config.enableWorkouts ? 'Ativado' : 'Desativado'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div>
                      <p className="text-white font-bold">Receitas Fitness</p>
                      <p className="text-gray-400 text-sm">15 receitas com macros</p>
                    </div>
                    <Button
                      onClick={() => setConfig({...config, enableNutrition: !config.enableNutrition})}
                      variant={config.enableNutrition ? 'default' : 'outline'}
                      className={config.enableNutrition ? 'bg-green-600' : 'border-gray-600'}
                    >
                      {config.enableNutrition ? 'Ativado' : 'Desativado'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div>
                      <p className="text-white font-bold">Acompanhamento de Progresso</p>
                      <p className="text-gray-400 text-sm">Registros e gráficos</p>
                    </div>
                    <Button
                      onClick={() => setConfig({...config, enableProgress: !config.enableProgress})}
                      variant={config.enableProgress ? 'default' : 'outline'}
                      className={config.enableProgress ? 'bg-green-600' : 'border-gray-600'}
                    >
                      {config.enableProgress ? 'Ativado' : 'Desativado'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div>
                      <p className="text-white font-bold">IA Coach</p>
                      <p className="text-gray-400 text-sm">Assistente fitness inteligente</p>
                    </div>
                    <Button
                      onClick={() => setConfig({...config, enableAICoach: !config.enableAICoach})}
                      variant={config.enableAICoach ? 'default' : 'outline'}
                      className={config.enableAICoach ? 'bg-green-600' : 'border-gray-600'}
                    >
                      {config.enableAICoach ? 'Ativado' : 'Desativado'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div>
                      <p className="text-white font-bold">Mostrar Frase de Impacto</p>
                      <p className="text-gray-400 text-sm">Exibir na página inicial</p>
                    </div>
                    <Button
                      onClick={() => setConfig({...config, showImpactPhrase: !config.showImpactPhrase})}
                      variant={config.showImpactPhrase ? 'default' : 'outline'}
                      className={config.showImpactPhrase ? 'bg-green-600' : 'border-gray-600'}
                    >
                      {config.showImpactPhrase ? 'Ativado' : 'Desativado'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Botão de Salvar Fixo */}
        <div className="fixed bottom-8 right-8 flex gap-4">
          <Button
            onClick={previewChanges}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black shadow-2xl"
          >
            <Eye className="h-5 w-5 mr-2" />
            VISUALIZAR
          </Button>
          <Button
            onClick={saveConfig}
            size="lg"
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-black shadow-2xl"
          >
            <Save className="h-5 w-5 mr-2" />
            SALVAR ALTERAÇÕES
          </Button>
        </div>
      </div>
    </div>
  )
}

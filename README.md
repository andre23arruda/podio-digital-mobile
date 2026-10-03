<h1 align="center">
    <img alt="Pódio Digital" title="Pódio Digital" src="./assets/images/favicon-2.png" width="50px" />
</h1>

<h4 align="center">
	🏆 Pódio Digital - App Mobile
</h4>

<p align="center">
	<a href="#-tecnologias">Tecnologias</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
	<a href="#-projeto">Projeto</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
	<a href="#-como-executar">Como Executar</a>
</p>

---
## 🚀 Tecnologias

- **React Native** (0.86+) & **React** (19.2+)
- **Expo** (SDK 57) com navegação via **Expo Router**
- **TypeScript**
- **Lucide Icons** (`lucide-react-native`)
- **React Native Paper**
- **EAS Build** (para geração de builds e APKs Android)

---
## 💻 Projeto
Aplicativo mobile oficial para acompanhamento em tempo real de torneios do **Pódio Digital**. Suporta visualização de chaves, fases de grupos, classificação, estatísticas e acompanhamento de jogos ao vivo.

- **Torneio Padrão**: Fases de grupos, classificação com regras de desempate e mata-mata (playoffs).
- **Rei / Rainha**: Rodadas dinâmicas com sorteio de duplas e classificação individual.
- **Futevôlei**: Sistema de chaveamento com Chave dos Vencedores, Chave dos Perdedores (repescagem) e Finais (dupla eliminação).

---
## 🛠️ Como executar

### 1. Pré-requisitos
- Node.js instalado (v18+)
- Gerenciador de pacotes `npm`
- App **Expo Go** instalado no smartphone (opcional, para testes no celular físico)

### 2. Instalação

```bash
# Clone ou acesse o repositório
cd podio-digital/mobile

# Instale as dependências
npm install
```

### 3. Executando o Projeto

Você pode iniciar o servidor de desenvolvimento via `make` ou `npx expo`:

```bash
make expo
# ou
npx expo start
```

No terminal do Expo:
- Pressione `a` para abrir no emulador Android.
- Pressione `i` para abrir no simulador iOS (macOS).
- Pressione `w` para abrir no navegador Web.
- Ou escaneie o **QR Code** no aplicativo **Expo Go** (Android/iOS).

### 4. Configuração de API (`.env`)

A aplicação utiliza a variável de ambiente `EXPO_PUBLIC_API_ROUTE` para se comunicar com o backend Django.

Crie ou edite o arquivo `.env` na raiz da pasta `mobile/`:

```env
# Desenvolvimento Local (Dispositivo Físico na mesma rede Wi-Fi):
EXPO_PUBLIC_API_ROUTE='http://192.168.0.103:8000/api'

# Desenvolvimento Local (Emulador / Navegador):
# EXPO_PUBLIC_API_ROUTE='http://localhost:8000/api'

```

> **Nota:** Para testar em um smartphone físico através do Expo Go, utilize o IP local da sua máquina na rede (ex: `192.168.X.X:8000`), garantindo que o backend esteja rodando com escuta aberta para a rede 


### 5. Geração de Build (APK Android)

O projeto está configurado com o **EAS Build** para geração direta do pacote APK instalável (profile `preview`):

```bash
make build-apk
# Executa internamente:
# npx -y eas-cli build -p android --profile preview
```

Ao finalizar a compilação na nuvem do Expo, um link de download direto e um QR Code serão exibidos no terminal.

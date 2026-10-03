import { theme } from '../constants/theme';

export function formatDate(dateString?: string | null): string {
  if (!dateString) return '';
  try {
    const [year, month, day] = dateString.split('-');
    if (!year || !month || !day) return dateString;
    return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return dateString || '';
  }
}

export function formatPeriod(torneio?: any): string {
  if (!torneio) return '';
  if (torneio.periodo && torneio.data_fim) {
    return `${formatDate(torneio.data)} - ${formatDate(torneio.data_fim)}`;
  }
  return formatDate(torneio.data);
}

export function abbreviateName(name: string): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length > 1) {
    return `${parts[0][0]}. ${parts.slice(1).join(' ')}`;
  }
  return name;
}

export function formatTeamName(dupla?: string | null): string {
  if (!dupla) return '';
  const result = dupla.replace(/<br\s*\/?>/gi, '\n');
  return result
    .split('\n')
    .map(abbreviateName)
    .join('\n');
}

export function formatTeamNameHelp(dupla?: string | null, jogo?: any, index = 0): string {
  if (jogo && jogo.dupla1 === null && jogo.dupla2 === null) {
    const help_text = jogo.help_text;
    if (help_text && help_text.includes('G')) {
      return help_text.split('x')[index]?.trim() || 'A definir';
    }
    return 'A definir';
  }
  const duplaName = dupla || 'BYE';
  return duplaName
    .replace(/<br\s*\/?>/gi, '\n')
    .split('\n')
    .map(abbreviateName)
    .join('\n');
}

export function renderTeamType(torneio?: any, number = ''): string {
  const teamType = torneio?.tipo === 'S' ? 'Jogador' : 'Dupla';
  return number ? `${teamType} ${number}` : teamType;
}

export function renderPoints(jogo: any, duplaKey: 'pontos_dupla1' | 'pontos_dupla2'): string {
  if (!jogo) return '-';
  if (jogo.help_text && typeof jogo.help_text === 'string' && jogo.help_text.includes('BYE')) {
    return '-';
  }
  const altKey = duplaKey === 'pontos_dupla1' ? 'placar_dupla1' : 'placar_dupla2';
  const val = jogo[duplaKey] !== undefined && jogo[duplaKey] !== null ? jogo[duplaKey] : jogo[altKey];
  return val !== null && val !== undefined ? String(val) : '-';
}

export function getWinnerColor(
  isWinner: boolean,
  isLoser: boolean,
  colors?: { success: string; error: string; textPrimary: string }
): string {
  const c = colors || theme.colors;
  if (isWinner) return c.success;
  if (isLoser) return c.error;
  return c.textPrimary;
}

export function cleanTeam(dupla?: string | null): string {
  if (!dupla) return '';
  return dupla
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .trim();
}

export function renderGameDate(
  dateString?: string | null,
  mode: 'vertical' | 'horizontal' = 'vertical'
): { formatted: string; dayMonth?: string; time?: string } | null {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    if (mode === 'horizontal') {
      return { formatted: `${hours}:${minutes}, ${day}/${month}` };
    }
    return {
      formatted: `${day}/${month} ${hours}:${minutes}`,
      dayMonth: `${day}/${month}`,
      time: `${hours}:${minutes}`,
    };
  } catch {
    return null;
  }
}

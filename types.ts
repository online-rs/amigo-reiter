
export type CardData = {
  de: string;
  para: string;
  mensagem: string;
  corFonte: string;
  tipoFonte: string;
  tamanhoFonte: number;
};

export type CardSide = 'frente' | 'verso';

export const FONT_OPTIONS = [
  { name: 'Montserrat', value: 'Montserrat, sans-serif' },
  { name: 'Dancing Script (Cursiva)', value: 'Dancing Script, cursive' },
  { name: 'Playfair Display', value: 'Playfair Display, serif' },
  { name: 'Open Sans', value: 'Open Sans, sans-serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif' }
];

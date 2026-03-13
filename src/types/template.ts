export interface TemplateItem {
  name: string;
  quantity: number;
  unit?: string;
  category?: string;
}

export interface ListTemplate {
  id: string;
  name: string;
  items: TemplateItem[];
  createdAt: Date;
}

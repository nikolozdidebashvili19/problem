type PageHeaderProps = {
  title: string;
  description?: string;
};

export const PageHeader = ({ title, description }: PageHeaderProps) => (
  <div className="flex flex-col gap-1">
    <h1 className="text-2xl">{title}</h1>
    {description && <p className="text-sm text-muted-foreground">{description}</p>}
  </div>
);

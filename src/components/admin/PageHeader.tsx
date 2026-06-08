export function PageHeader({
 title,
 description,
 children,
}: {
 title: string;
 description: string;
 children?: React.ReactNode;
}) {
 return (
 <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
 <div>
 <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
 <p className="text-sm text-muted-foreground mt-2">{description}</p>
 </div>
 {children}
 </div>
 );
}

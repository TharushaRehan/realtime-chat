type Props = {
  title: string;
  description?: string;
};
const ErrorMessage = ({ title, description }: Props) => {
  return (
    <div className="bg-red-950/50 border rounded-md border-red-900 p-4 text-center">
      <p className="text-red-500 text-sm font-bold">{title}</p>
      {description && (
        <p className="text-zinc-500 text-xs mt-1">{description}</p>
      )}
    </div>
  );
};

export { ErrorMessage };

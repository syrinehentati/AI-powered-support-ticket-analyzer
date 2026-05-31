interface Props {
  title: string;
  subtitle: string;
}

export default function PageHeader({
  title,
  subtitle,
}: Props) {
  return (
    <div
      style={{
        marginBottom: 32,
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: 32,
          fontWeight: 700,
        }}
      >
        {title}
      </h1>

      <p
        style={{
          marginTop: 8,
          color: '#64748b',
        }}
      >
        {subtitle}
      </p>
    </div>
  );
}
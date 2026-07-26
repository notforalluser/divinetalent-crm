import { Link } from "react-router-dom";
import { Heading, Text } from "../components/ui/Typography";
import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cloud p-6 text-center">
      <Heading variant="display" color="accent">
        404
      </Heading>
      <Text variant="bodyLg" color="muted" className="mt-2 mb-6">
        This page doesn't exist.
      </Text>
      <Link to="/">
        <Button>Back to home</Button>
      </Link>
    </div>
  );
}

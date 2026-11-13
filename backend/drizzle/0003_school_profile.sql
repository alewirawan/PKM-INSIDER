ALTER TYPE "public"."document_kind" ADD VALUE 'rapor';--> statement-breakpoint
ALTER TYPE "public"."document_kind" ADD VALUE 'pasfoto';--> statement-breakpoint
ALTER TABLE "school_settings" DROP CONSTRAINT "school_settings_text_ck";--> statement-breakpoint
ALTER TABLE "teachers" ALTER COLUMN "cluster" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "teachers" ALTER COLUMN "years" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "school_settings" ADD CONSTRAINT "school_settings_text_ck" CHECK (length(btrim("school_settings"."school_name")) >= 2 AND length(btrim("school_settings"."tagline")) >= 2 AND length(btrim("school_settings"."address")) >= 10 AND ("school_settings"."phone" = '' OR length("school_settings"."phone") BETWEEN 8 AND 30) AND ("school_settings"."whatsapp" = '' OR length("school_settings"."whatsapp") BETWEEN 8 AND 30));
--> statement-breakpoint
CREATE OR REPLACE FUNCTION nh_valid_document_requirements(value jsonb) RETURNS boolean
LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE WHEN coalesce(jsonb_typeof(value) = 'object'
    AND jsonb_typeof(value->'requiredKinds') = 'array'
    AND jsonb_typeof(value->'requireOneGraduationDocument') = 'boolean', false)
  THEN (value - 'requiredKinds' - 'requireOneGraduationDocument') = '{}'::jsonb
    AND (value->'requiredKinds') <@ '["skl","ijazah","kk","ktp","akta","rapor","pasfoto"]'::jsonb
    AND jsonb_array_length(value->'requiredKinds') = (SELECT count(DISTINCT item) FROM jsonb_array_elements(value->'requiredKinds') item)
  ELSE false END;
$$;

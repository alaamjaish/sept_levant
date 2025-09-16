

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."exercise_level" AS ENUM (
    'beginner',
    'intermediate',
    'advanced'
);


ALTER TYPE "public"."exercise_level" OWNER TO "postgres";


CREATE TYPE "public"."fc_card_status" AS ENUM (
    'pending_enrichment',
    'ready',
    'error_enrichment'
);


ALTER TYPE "public"."fc_card_status" OWNER TO "postgres";


CREATE TYPE "public"."fc_job_status" AS ENUM (
    'queued',
    'running',
    'done',
    'error'
);


ALTER TYPE "public"."fc_job_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_exercise_position"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$                                                                                                                                     
  declare                                                                                                                                                   
    next_pos integer;                                                                                                                                       
    lvl text;                                                                                                                                               
  begin                                                                                                                                                     
    lvl := coalesce(new.level, 'beginner');                                                                                                                 
    if new.position is null then                                                                                                                            
      select coalesce(max(position), 0) + 1 into next_pos                                                                                                   
      from public.exercises                                                                                                                                 
      where exercise_type = new.exercise_type                                                                                                               
        and coalesce(level, 'beginner') = lvl;                                                                                                              
      new.position := next_pos;                                                                                                                             
    end if;                                                                                                                                                 
    return new;                                                                                                                                             
  end;                                                                                                                                                      
  $$;


ALTER FUNCTION "public"."set_exercise_position"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."touch_alignment_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  if (coalesce(new.alignment_status,'') is distinct from coalesce(old.alignment_status,''))
     or (coalesce(new.alignment_json_url,'') is distinct from coalesce(old.alignment_json_url,''))
     or (coalesce(new.audio_sha256,'') is distinct from coalesce(old.audio_sha256,''))
  then
    new.alignment_updated_at := now();
  end if;
  return new;
end;
$$;


ALTER FUNCTION "public"."touch_alignment_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."attempts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "exercise_id" "uuid",
    "student_id" "uuid",
    "passed" boolean,
    "score" integer,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."attempts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."exercises" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "arabic_text" "text" NOT NULL,
    "audio_url" "text" NOT NULL,
    "exercise_type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "audio_duration_ms" integer,
    "alignment_json_url" "text",
    "alignment_status" "text" DEFAULT 'pending'::"text",
    "audio_sha256" "text",
    "alignment_updated_at" timestamp with time zone DEFAULT "now"(),
    "difficulty_level" integer,
    "level" "text" DEFAULT 'beginner'::"public"."exercise_level" NOT NULL,
    "title" "text",
    "short_description" "text",
    "position" integer,
    "is_demo" boolean DEFAULT false,
    CONSTRAINT "exercises_alignment_status_check" CHECK (("alignment_status" = ANY (ARRAY['pending'::"text", 'processing'::"text", 'ready'::"text", 'failed'::"text"]))),
    CONSTRAINT "exercises_difficulty_level_check" CHECK ((("difficulty_level" >= 1) AND ("difficulty_level" <= 5))),
    CONSTRAINT "exercises_exercise_type_check" CHECK (("exercise_type" = ANY (ARRAY['listening'::"text", 'speaking'::"text"]))),
    CONSTRAINT "exercises_level_check" CHECK (("level" = ANY (ARRAY['beginner'::"text", 'intermediate'::"text", 'advanced'::"text"])))
);


ALTER TABLE "public"."exercises" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text",
    "role" "text" DEFAULT 'student'::"text",
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['student'::"text", 'teacher'::"text", 'admin'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fc_decks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "fc_decks_name_check" CHECK ((("name")::"text" <> ''::"text")),
    CONSTRAINT "fc_decks_pkey" PRIMARY KEY ("id")
);


ALTER TABLE "public"."fc_decks" OWNER TO "postgres";

ALTER TABLE "public"."fc_decks"
    ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT "now"();

UPDATE "public"."fc_decks"
SET "updated_at" = COALESCE("updated_at", "created_at", "now"())
WHERE "updated_at" IS NULL;

ALTER TABLE "public"."fc_decks"
    ALTER COLUMN "updated_at" SET DEFAULT "now"();


CREATE TABLE IF NOT EXISTS "public"."fc_cards" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "deck_id" "uuid" NOT NULL,
    "front_text" "text" NOT NULL,
    "back_meaning" "text",
    "example_text" "text",
    "tts_word_url" "text",
    "tts_example_url" "text",
    "pos" "text",
    "transliteration" "text",
    "language" "text" DEFAULT 'ar'::"text" NOT NULL,
    "status" "public"."fc_card_status" DEFAULT 'pending_enrichment'::"public"."fc_card_status" NOT NULL,
    "error_reason" "text",
    "context_text" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "fc_cards_pkey" PRIMARY KEY ("id")
);


ALTER TABLE "public"."fc_cards" OWNER TO "postgres";

ALTER TABLE "public"."fc_cards"
    ADD COLUMN IF NOT EXISTS "language" "text";

ALTER TABLE "public"."fc_cards"
    ADD COLUMN IF NOT EXISTS "error_reason" "text";

ALTER TABLE "public"."fc_cards"
    ADD COLUMN IF NOT EXISTS "context_text" "text";

UPDATE "public"."fc_cards"
SET "language" = COALESCE(NULLIF(TRIM("language"), ''), 'ar')
WHERE "language" IS NULL OR TRIM("language") = '';

ALTER TABLE "public"."fc_cards"
    ALTER COLUMN "language" SET DEFAULT 'ar'::"text";

ALTER TABLE "public"."fc_cards"
    ALTER COLUMN "language" SET NOT NULL;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'fc_cards'
          AND column_name = 'status'
          AND udt_name = 'text'
    ) THEN
        EXECUTE 'ALTER TABLE public.fc_cards ALTER COLUMN status TYPE public.fc_card_status USING status::public.fc_card_status';
    END IF;
END $$;

ALTER TABLE "public"."fc_cards"
    ALTER COLUMN "status" SET DEFAULT 'pending_enrichment'::"public"."fc_card_status";


CREATE TABLE IF NOT EXISTS "public"."fc_jobs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "card_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "job_type" "text" DEFAULT 'enrich'::"text" NOT NULL,
    "status" "public"."fc_job_status" DEFAULT 'queued'::"public"."fc_job_status" NOT NULL,
    "error_reason" "text",
    "payload" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "fc_jobs_pkey" PRIMARY KEY ("id")
);


ALTER TABLE "public"."fc_jobs" OWNER TO "postgres";

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'fc_jobs'
          AND column_name = 'type'
    )
    AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'fc_jobs'
          AND column_name = 'job_type'
    ) THEN
        EXECUTE 'ALTER TABLE public.fc_jobs RENAME COLUMN type TO job_type';
    END IF;
END $$;

ALTER TABLE "public"."fc_jobs"
    ADD COLUMN IF NOT EXISTS "payload" "jsonb";

ALTER TABLE "public"."fc_jobs"
    ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT "now"();

UPDATE "public"."fc_jobs"
SET "job_type" = COALESCE(NULLIF(TRIM("job_type"), ''), 'enrich')
WHERE "job_type" IS NULL OR TRIM("job_type") = '';

ALTER TABLE "public"."fc_jobs"
    ALTER COLUMN "job_type" SET DEFAULT 'enrich'::"text";

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'fc_jobs'
          AND column_name = 'status'
          AND udt_name = 'text'
    ) THEN
        EXECUTE 'ALTER TABLE public.fc_jobs ALTER COLUMN status TYPE public.fc_job_status USING status::public.fc_job_status';
    END IF;
END $$;

ALTER TABLE "public"."fc_jobs"
    ALTER COLUMN "status" SET DEFAULT 'queued'::"public"."fc_job_status";

UPDATE "public"."fc_jobs"
SET "updated_at" = COALESCE("updated_at", "created_at", "now"())
WHERE "updated_at" IS NULL;

ALTER TABLE "public"."fc_jobs"
    ALTER COLUMN "updated_at" SET DEFAULT "now"();


ALTER TABLE ONLY "public"."attempts"
    ADD CONSTRAINT "attempts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."exercises"
    ADD CONSTRAINT "exercises_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_exercises_alignment_status" ON "public"."exercises" USING "btree" ("alignment_status");



CREATE INDEX "idx_exercises_audio_sha256" ON "public"."exercises" USING "btree" ("audio_sha256");



CREATE INDEX "idx_exercises_type_level_position" ON "public"."exercises" USING "btree" ("exercise_type", "level", "position");



CREATE INDEX "idx_fc_cards_user_deck" ON "public"."fc_cards" USING "btree" ("user_id", "deck_id");



CREATE INDEX "idx_fc_cards_status" ON "public"."fc_cards" USING "btree" ("status");



CREATE INDEX "idx_fc_decks_user" ON "public"."fc_decks" USING "btree" ("user_id");



CREATE INDEX "idx_fc_jobs_status" ON "public"."fc_jobs" USING "btree" ("status");



CREATE OR REPLACE TRIGGER "set_exercise_position_insert" BEFORE INSERT ON "public"."exercises" FOR EACH ROW EXECUTE FUNCTION "public"."set_exercise_position"();



CREATE OR REPLACE TRIGGER "trg_touch_alignment_updated_at" BEFORE UPDATE ON "public"."exercises" FOR EACH ROW EXECUTE FUNCTION "public"."touch_alignment_updated_at"();



ALTER TABLE ONLY "public"."attempts"
    ADD CONSTRAINT "attempts_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."attempts"
    ADD CONSTRAINT "attempts_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."fc_decks"
    ADD CONSTRAINT "fc_decks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."fc_cards"
    ADD CONSTRAINT "fc_cards_deck_id_fkey" FOREIGN KEY ("deck_id") REFERENCES "public"."fc_decks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."fc_cards"
    ADD CONSTRAINT "fc_cards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."fc_jobs"
    ADD CONSTRAINT "fc_jobs_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "public"."fc_cards"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."fc_jobs"
    ADD CONSTRAINT "fc_jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE "public"."attempts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "delete_exercises_teachers" ON "public"."exercises" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['teacher'::"text", 'admin'::"text"]))))));



ALTER TABLE "public"."exercises" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "insert_exercises_teachers" ON "public"."exercises" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['teacher'::"text", 'admin'::"text"]))))));



CREATE POLICY "insert_own_attempts" ON "public"."attempts" FOR INSERT WITH CHECK (("student_id" = "auth"."uid"()));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;



ALTER TABLE "public"."fc_decks" ENABLE ROW LEVEL SECURITY;



ALTER TABLE "public"."fc_cards" ENABLE ROW LEVEL SECURITY;



ALTER TABLE "public"."fc_jobs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "read_exercises" ON "public"."exercises" FOR SELECT USING (true);



CREATE POLICY "read_own_attempts" ON "public"."attempts" FOR SELECT USING (("student_id" = "auth"."uid"()));



CREATE POLICY "read_own_profile" ON "public"."profiles" FOR SELECT USING (("id" = "auth"."uid"()));



CREATE POLICY "select_own_fc_decks" ON "public"."fc_decks" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "select_own_fc_cards" ON "public"."fc_cards" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "select_own_fc_jobs" ON "public"."fc_jobs" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "insert_own_fc_decks" ON "public"."fc_decks" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "insert_own_fc_cards" ON "public"."fc_cards" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "insert_own_fc_jobs" ON "public"."fc_jobs" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "update_own_fc_decks" ON "public"."fc_decks" FOR UPDATE USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "update_own_fc_cards" ON "public"."fc_cards" FOR UPDATE USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "delete_own_fc_decks" ON "public"."fc_decks" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "delete_own_fc_cards" ON "public"."fc_cards" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "update_exercises_teachers" ON "public"."exercises" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['teacher'::"text", 'admin'::"text"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['teacher'::"text", 'admin'::"text"]))))));



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_exercise_position"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_exercise_position"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_exercise_position"() TO "service_role";



GRANT ALL ON FUNCTION "public"."touch_alignment_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."touch_alignment_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."touch_alignment_updated_at"() TO "service_role";



GRANT ALL ON TABLE "public"."attempts" TO "anon";
GRANT ALL ON TABLE "public"."attempts" TO "authenticated";
GRANT ALL ON TABLE "public"."attempts" TO "service_role";



GRANT ALL ON TABLE "public"."exercises" TO "anon";
GRANT ALL ON TABLE "public"."exercises" TO "authenticated";
GRANT ALL ON TABLE "public"."exercises" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."fc_decks" TO "anon";
GRANT ALL ON TABLE "public"."fc_decks" TO "authenticated";
GRANT ALL ON TABLE "public"."fc_decks" TO "service_role";



GRANT ALL ON TABLE "public"."fc_cards" TO "anon";
GRANT ALL ON TABLE "public"."fc_cards" TO "authenticated";
GRANT ALL ON TABLE "public"."fc_cards" TO "service_role";



GRANT ALL ON TABLE "public"."fc_jobs" TO "anon";
GRANT ALL ON TABLE "public"."fc_jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."fc_jobs" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






RESET ALL;

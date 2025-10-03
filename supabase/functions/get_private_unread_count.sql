-- Returns unread message count for a given private chat and user
create or replace function get_private_unread_count(
  p_private_chat_id uuid,
  p_user_id uuid
) returns integer as $$
begin
  return (
    select count(*) from private_messages m
    where m.private_chat_id = p_private_chat_id
      and m.sender_id <> p_user_id
      and m.created_at > coalesce((
        select last_read_at from user_chat_read_status
        where private_chat_id = p_private_chat_id and user_id = p_user_id
      ), '1970-01-01')
  );
end;
$$ language plpgsql security definer;

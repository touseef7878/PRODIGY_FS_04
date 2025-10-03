-- Returns unread message count for a given chat and user
create or replace function get_unread_count(
  p_chat_room_id uuid,
  p_user_id uuid
) returns integer as $$
begin
  return (
    select count(*) from messages m
    where m.chat_room_id = p_chat_room_id
      and m.sender_id <> p_user_id
      and m.created_at > coalesce((
        select last_read_at from user_chat_read_status
        where chat_room_id = p_chat_room_id and user_id = p_user_id
      ), '1970-01-01')
  );
end;
$$ language plpgsql security definer;

-- For private chats, similar function can be created if needed.
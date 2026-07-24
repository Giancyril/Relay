from typing import List


def recursive_character_text_splitter(
    text: str,
    chunk_size: int = 400,
    chunk_overlap: int = 50,
    separators: List[str] = None
) -> List[str]:
    """
    Recursively splits input text into chunks of specified maximum size with overlap.
    """
    if separators is None:
        separators = ["\n\n", "\n", ". ", " ", ""]

    text = text.strip()
    if not text:
        return []

    if len(text) <= chunk_size:
        return [text]

    # Find best separator
    chosen_sep = separators[-1]
    for sep in separators:
        if sep in text:
            chosen_sep = sep
            break

    splits = text.split(chosen_sep) if chosen_sep != "" else list(text)

    chunks = []
    current_chunk = []
    current_length = 0

    for split in splits:
        piece = split + (chosen_sep if chosen_sep != "" else "")
        piece_len = len(piece)

        if current_length + piece_len > chunk_size and current_chunk:
            combined = "".join(current_chunk).strip()
            if combined:
                chunks.append(combined)

            # Keep overlap from end of current chunk
            overlap_buffer = []
            overlap_len = 0
            for prev_item in reversed(current_chunk):
                if overlap_len + len(prev_item) <= chunk_overlap:
                    overlap_buffer.insert(0, prev_item)
                    overlap_len += len(prev_item)
                else:
                    break

            current_chunk = overlap_buffer + [piece]
            current_length = sum(len(x) for x in current_chunk)
        else:
            current_chunk.append(piece)
            current_length += piece_len

    if current_chunk:
        combined = "".join(current_chunk).strip()
        if combined:
            chunks.append(combined)

    return chunks

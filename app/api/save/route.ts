import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = authHeader.replace('Bearer ', '')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { action, article } = body

  if (action === 'save') {
    const { error } = await supabase.from('flowly_saved').upsert({
      user_id: user.id,
      article_url: article.url,
      article_title: article.title,
      article_source: article.source,
      article_topic: article.topic,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  if (action === 'unsave') {
    const { error } = await supabase
      .from('flowly_saved')
      .delete()
      .eq('user_id', user.id)
      .eq('article_url', article.url)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  if (action === 'list') {
    const { data, error } = await supabase
      .from('flowly_saved')
      .select('*')
      .eq('user_id', user.id)
      .order('saved_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ saved: data })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
